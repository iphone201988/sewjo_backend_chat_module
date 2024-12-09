import mongoose from "mongoose";

const fabricSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,			
		},
		material: {
			type: String,
			required: true,
		},
		width: {
			type: Number,
			required: true,
		},
		weight: {
			type: Number,
			required: true,
		},
		colour: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		imageUrls: {
			type: Array,
			required: true,
		},
		userRef: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Fabric = mongoose.model("Fabric", fabricSchema);

export default Fabric;
