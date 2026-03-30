import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client"
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts"

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email', triggers: [{ event: 'app/user.created' }] },
    async ({ event, step }) => {
        const payload = event.data as Record<string, string>;
        const userProfile = `
            - Country: ${payload.country}
            - Investment Goals: ${payload.investmentGoals}
            - Risk Tolerance: ${payload.riskTolerance}
            - Preferred Industry: ${payload.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer("generate-welcome-intro", {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0]
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Stocket! You now have a powerful tool to track stocks, monitor markets, and make informed investment decisions.'

            const { data: { email, name }} = event
            
            return await sendWelcomeEmail({
                email,
                name,
                intro: introText
            })
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)