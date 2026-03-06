import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

friendSchema.pre("save", async function() {
    const idA = this.userA.toString();
    const idB = this.userB.toString();

    if (idA > idB) {
        const temp = this.userA;
        this.userA = this.userB;
        this.userB = temp;
    }
});

friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;