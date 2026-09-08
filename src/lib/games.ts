import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

export interface GameFilters {
    /** Category IDs to match; games may match any selected category. */
    categoryIds?: number[];
    /** Publisher ID to match. */
    publisherId?: number;
}

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Returns games matching the requested category and publisher filters, ordered by title.
 *
 * @param db - Database client to query; accepts the production client or an in-memory test client.
 * @param filters - Optional category IDs and publisher ID. Empty category selections match all categories.
 * @returns Games matching every active filter, ordered alphabetically by title.
 */
export async function getAllGames(
    db: Database,
    filters: GameFilters = {},
): Promise<Game[]> {
    const categoryCondition = filters.categoryIds?.length
        ? inArray(games.categoryId, filters.categoryIds)
        : undefined;
    const publisherCondition = filters.publisherId === undefined
        ? undefined
        : eq(games.publisherId, filters.publisherId);
    const rows = await baseGamesQuery(db)
        .where(and(categoryCondition, publisherCondition))
        .orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * Returns every game ID ordered by title.
 *
 * @param db - Database client to query; accepts the production client or an in-memory test client.
 * @returns All game IDs in deterministic title order.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * Returns a game by ID.
 *
 * @param db - Database client to query; accepts the production client or an in-memory test client.
 * @param id - Game ID to retrieve.
 * @returns The matching game, or `null` when it does not exist.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
