import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

const DAY_IN_MS = 86_400_000

export const checkSubscriptiion = async () => {
    const { orgId } = auth()

    if(!orgId) {
        return false
    }

    const orgSubscription = await db.orgSubscription.findUnique({
        where: {
            orgId
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true
        }
    })

    if(!orgSubscription) {
        return false
    }

    const isValid = 
        orgSubscription.stripePriceId && 
        orgSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()
    
    return !!isValid
}