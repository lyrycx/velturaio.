import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { referralCode, newUserId } = await req.json()
        
        const referrerId = parseInt(referralCode.replace('ref_', ''))
        
        if (!referrerId || !newUserId) {
            return NextResponse.json({ error: 'Invalid referral data' }, { status: 400 })
        }

        // Update referrer with points and increment friends count
        const referrer = await prisma.user.update({
            where: { telegramId: referrerId },
            data: {
                points: { increment: 50000 },
                friends: { increment: 1 }
            }
        })

        // Give bonus points to new user
        const newUser = await prisma.user.update({
            where: { telegramId: newUserId },
            data: {
                points: { increment: 25000 },
                hasUsedReferral: true
            }
        })

        return NextResponse.json({ 
            success: true, 
            referrer, 
            newUser,
            message: "Referral bonus claimed! You received 25,000 points and your friend got 50,000 points!" 
        })
    } catch (error) {
        console.error('Error processing referral:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
