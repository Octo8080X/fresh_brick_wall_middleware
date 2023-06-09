import { type MiddlewareHandlerContext } from "../deps.ts";
import { BrickWallValidator } from "./brick_wall_validator.ts";

const brickWallValidator = new BrickWallValidator();

export async function brickWallHandler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  await brickWallValidator.validate(req);
  return ctx.next();
}
