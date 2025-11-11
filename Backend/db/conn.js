import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FomeZap";

async function main(){
    await mongoose.connect(MONGODB_URI);
    console.log("Conectou mongodb");
}
main().catch((err)=>console.log(err));

export default mongoose;