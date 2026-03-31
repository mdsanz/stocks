'use server'

import { auth } from "@/lib/better-auth/auth"
import { inngest } from "@/lib/inngest/client"
import { headers } from "next/headers"

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, preferredIndustry, riskTolerance }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: { email, password, name: fullName },
            headers: await headers()
        })

        if (!response) {
            return { success: false, error: 'Signup failed. Please try again.', data: response }
        }

        // Send Inngest event non-blocking - don't let it fail the sign-up
        try {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })
        } catch (inngestError) {
            console.warn('Inngest event failed (non-critical):', inngestError)
        }

        return { success: true, data: response }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error signing up:', message, error)
        return { success: false, error: message }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password },
            headers: await headers()
        })

        if (!response) {
            return { success: false, error: 'Authentication failed. Please check your credentials.', data: response }
        }

        return { success: true, data: response }
    } catch (error) {
        console.log('Error signing in:', error)
        return { success: false, error: 'Failed to sign in. Please try again.' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({
            headers: await headers()
        })
        return { success: true }
    } catch (error) {
        console.error('Error signing out:', error)
        return { success: false, error: 'Failed to sign out. Please try again.' }
    }
}