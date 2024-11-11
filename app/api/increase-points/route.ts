import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, points } = await req.json()
        
        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                points: { increment: points }
            }
        })

        return NextResponse.json({ 
            points: updatedUser.points 
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
