/**
 * LOT_SIZE is the number of underlying units one lot represents. A quantity of
 * N lots is worth N * LOT_SIZE economically.
 *
 * This mirrors `lotsize.Size` in the backend (internal/shared/lotsize), which
 * applies it to every margin, notional and PnL figure the API returns. Anything
 * the UI recomputes locally from a price and a lot count must apply it too, or
 * the number lands 25x too small next to the server's.
 */
export const LOT_SIZE = 25;
