import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { sendWelcomeEmail, sendDailyNewsEmail } from "../nodemailer";
import { inngest, isAIEnabled } from "./client"
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "./prompts"
import sanitizeHtml from "sanitize-html";

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

        const response = isAIEnabled ? await step.ai.infer("generate-welcome-intro", {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ]
            }
        }) : null

        await step.run('send-welcome-email', async () => {
            const part = response?.candidates?.[0]?.content?.parts?.[0]
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Stocket! You now have a powerful tool to track stocks, monitor markets, and make informed investment decisions.'

            const { data: { email, name } } = event

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

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary', triggers: [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }] },
    async ({ step }) => {
        const users = await step.run('get-all-users', async () => {
            return getAllUsersForNewsEmail()
        })

        if (!users.length) return { success: false, message: 'No users found for news email' }

        for (const user of users) {
            try {
                const symbols = await step.run(`get-watchlist-${user.id}`, async () => {
                    if (!user.email) return [];
                    return getWatchlistSymbolsByEmail(user.email);
                });

                const newsArticles = await step.run(`fetch-news-${user.id}`, async () => {
                    return getNews(symbols);
                });

                if (!newsArticles || newsArticles.length === 0) continue;

                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(newsArticles));

                const response = isAIEnabled ? await step.ai.infer(`generate-news-summary-${user.id}`, {
                    model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
                    body: {
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: prompt }]
                            }
                        ]
                    }
                }) : null;

                const part = response?.candidates?.[0]?.content?.parts?.[0];
                let newsContent = (part && 'text' in part ? part.text : null) || 'No news summary available for today.';

                // Clean up any markdown code blocks the AI might mistakenly add
                newsContent = newsContent.replace(/^```(html)?\n?|```$/gi, '').trim();

                // Sanitize output for safe HTML injection in emails
                newsContent = sanitizeHtml(newsContent, {
                    allowedTags: ['p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'img', 'h1', 'h2', 'h3'],
                    allowedAttributes: {
                        'a': ['href', 'target', 'rel'],
                        'img': ['src', 'alt']
                    },
                    allowProtocolRelative: false,
                    allowedSchemes: ['https', 'http'],
                    allowedSchemesByTag: {
                        img: ['https']
                    },
                    transformTags: {
                        'a': (tagName, attribs) => {
                            return {
                                tagName: 'a',
                                attribs: {
                                    ...attribs,
                                    target: '_blank',
                                    rel: 'noopener noreferrer'
                                }
                            };
                        }
                    }
                });

                await step.run(`send-news-email-${user.id}`, async () => {
                    if (user.email) {
                        await sendDailyNewsEmail({
                            email: user.email,
                            newsContent
                        });
                    }
                });
            } catch (userError) {
                console.error(`Error processing news digest for user ${user.id}:`, userError);
                continue;
            }
        }

        return { success: true, message: 'Daily news summary sent successfully' };
    }
)