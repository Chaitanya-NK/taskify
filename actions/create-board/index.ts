"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types"
import { CreateBoard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { incrementAvailableCount, hasAvailableCount } from "@/lib/org-limit";
import { checkSubscriptiion } from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unauthorized."
        }
    }

    const canCreateBoard = await hasAvailableCount()
    const isPro = await checkSubscriptiion()

    if(!canCreateBoard && !isPro) {
        return {
            error: "You have reached the limit of boards you can create. Please upgrade your plan."
        }
    }

    const { title, image } = data;

    const [
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageUserName,
        imageLinkHTML
    ] = image.split("|")

    if (!imageId || !imageThumbUrl || !imageFullUrl || !imageUserName || !imageLinkHTML) {
        return {
            error: "Missing fields. Failed to create board."
        }
    }

    let board;

    try {
        board = await db.board.create({
            data: {
                title,
                orgId,
                imageId,
                imageThumbUrl,
                imageFullUrl,
                imageUserName,
                imageLinkHTML
            }
        })

        if(!isPro) {
            await incrementAvailableCount()
        }

        await createAuditLog({
            entityTitle: board.title,
            entityId: board.id,
            entityType: ENTITY_TYPE.BOARD,
            action: ACTION.CREATE
        })
    } catch (error) {
        return {
            error: "Failed to create."
        }
    }

    revalidatePath(`/board/${board.id}`)
    return { data: board }
}

export const createBoard = createSafeAction(CreateBoard, handler);