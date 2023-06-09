import { bcrypt, verify } from "../deps.ts";
import { importKey } from "./import_key.ts";

export class BrickWallValidator {
  #BRICK_WALL_HASHED_PASSWORD!: string;
  #BRICK_WALL_JWT_KEY!: CryptoKey;
  constructor() {}
  public async init() {
    const brickWallJwtKey = Deno.env.get("BRICK_WALL_JWT_KEY");
    if (!brickWallJwtKey) {
      throw new Error("No set env `BRICK_WALL_JWT_KEY`");
    }
    this.#BRICK_WALL_JWT_KEY = await importKey(brickWallJwtKey);

    const brickWallHashedPassword = Deno.env.get("BRICK_WALL_HASHED_PASSWORD");
    if (!brickWallHashedPassword) {
      throw new Error("No set env `BRICK_WALL_HASHED_PASSWORD`");
    }
    this.#BRICK_WALL_HASHED_PASSWORD = brickWallHashedPassword;
  }

  isSetMembers(): boolean {
    return !!this.#BRICK_WALL_HASHED_PASSWORD && !!this.#BRICK_WALL_JWT_KEY;
  }

  public async validate(req: Request): Promise<never | void> {
    if (!this.isSetMembers()) {
      await this.init();
    }
    const { headers } = req;
    const brickWallToken = headers.get("brick-wall-token");

    if (!brickWallToken) {
      throw new Error("No set header `brick-wall-token`.");
    }
    console.log([brickWallToken, this.#BRICK_WALL_JWT_KEY]);
    const payload = await verify(brickWallToken, this.#BRICK_WALL_JWT_KEY);
    console.log(payload);
    if (!payload) {
      throw new Error("Invalid `brick-wall-token 1`.");
    }
    if (!payload.brickWallToken || typeof payload.brickWallToken !== "string") {
      throw new Error("No set parameter `brickWallToken`.");
    }

    console.log([payload.brickWallToken, this.#BRICK_WALL_HASHED_PASSWORD!, bcrypt.hashSync("test")])

    if (
      !bcrypt.compareSync(
        payload.brickWallToken,
        this.#BRICK_WALL_HASHED_PASSWORD!,
      )
    ) {
      throw new Error("Invalid `brick-wall-token 2`.");
    }
  }
}
