import  jwt  from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type JwtPayload = {
    sub: string;   //subject isme user ki id rkh rhe h
    role: "ADMIN" | "MANAGER" | "TEAM_MEMBER";
};


export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "8h" });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

