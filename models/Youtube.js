import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: String,
    description: String,
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    lectures: [
        {   
            thumbnail:{
                public_id:{
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            },
            title: {
                type: String,
                required: true,
            },
            url: {
                type: String,
            },
            description: {
                type: String,
                required: true,
            },
        }
    ]
});

export default mongoose.model("Youtube", schema);