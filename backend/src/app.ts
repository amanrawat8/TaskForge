import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { clientRouter } from "./modules/clients/client.routes.js";


const app = express();
const PORT = process.env.PORT || 8001;


app.use(cors());
app.use(express.json());


app.get("/api/health", async (req, res) => {

    await prisma.$queryRaw `SELECT 1`;
    res.json({
        success: true,
        message: "Task API is running"
    })
})


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/clients", clientRouter);

app.use(errorHandler);




app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
});
