import { catchAsync, sendSuccess, sendError } from 'devdad-express-utils'
import mongoose from 'mongoose'
import { User } from '../model/user.mogoose.model.js'
import fs from 'fs'
import { imagekitClient } from '../utils/imagekit.conf.js'
import ImageKit from '@imagekit/nodejs';
import type { Request, Response } from 'express'

interface user {
    username: string,
    password: string
}
export interface dbuser {
    uid: string,
    username: string,
    password: string,
    _id: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
    image?: Array<{
        url: string,
        fieldId: string,
        metadata: imagemetadata
    }>,
    __v: number,
    genToken(): Promise<string>;
}

export interface imagemetadata {
    name: string,
    versionInfo: {
        id: string,
        name: string
    },
    filepath: string,
    fileType: string,
    dimensions: {
        width: number,
        height: number
    },
    thumbnailUrl: string
}
export type AuthRequest = Request & { user?: dbuser };
const genaccessToken = async function (uid: string): Promise<string | null | undefined> {
    try {
        const user: dbuser | null = await User.findOne({ uid: uid })
        if (!user) {
            return null;
        }
        const accessToken = await user.genToken();
        console.log(accessToken);
        return accessToken;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

const reguser = catchAsync(async (req, res) => {
    try {
        if (req.body === null || req.body === undefined) {
            return sendError(res, "Please provide user details", 400, null)
        }
        const userDetails: user = req.body;
        if (typeof (userDetails.username) !== 'string' || typeof (userDetails.password) !== 'string') {
            return sendError(res, "username or password is not a string", 400, null)
        }
        const user = await User.create(userDetails)
        const accessToken = await genaccessToken(user.uid)
        console.log(accessToken);
        if (accessToken === null) {
            return sendError(res, "User not found", 404, null)
        } else if (accessToken === undefined) {
            return sendError(res, "Internal server error could not generate token", 500, null)
        }
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        return sendSuccess(
            res, {
            accessToken, user
        }, "User registered successfully", 201)
    } catch (error) {
        console.log(error);
        return sendError(
            res, "Internal server error", 500, error
        )
    }
})
// login user 
const loginUser = catchAsync(async (req, res) => {
    try {
        const userDetails: user = req.body;
        if (typeof (userDetails.username) !== 'string' || typeof (userDetails.password) !== 'string') {
            return sendError(res, "username or password is not a string", 400, null)
        }
        const user: dbuser | null = await User.findOne({ username: userDetails.username }).select('-password -image')
        console.log(user);
        if (!user) {
            return sendError(res, "User not found", 404, null)
        }
        const accessToken = await genaccessToken(user.uid)
        if (accessToken === null) {
            return sendError(res, "User not found", 404, null)
        } else if (accessToken === undefined) {
            return sendError(res, "Internal server error could not generate token", 500, null)
        }
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        return sendSuccess(
            res, {
            accessToken, user
        }, "User logged in successfully", 200
        )

    } catch (error) {
        console.log(error);
        return sendError(
            res, "Internal server error", 500, error
        )
    }
})
// upload image
const imageUploader = catchAsync(async (req: AuthRequest, res: Response) => {
    console.log(req.file?.path)
    try {
        if (!req.file) {
            return sendError(res, "No file uploaded", 400, null)
        }
        const params: ImageKit.FileUploadParams = {
            file: fs.createReadStream(`${req.file.path}`),
            fileName: `${req.file.originalname}`,
        };
        if (!imagekitClient) {
            return sendError(res, "Imagekit not connected", 500, null)
        }
        const response: ImageKit.FileUploadResponse = await imagekitClient.files.upload(params);
        // delete the file from local storage
        fs.unlinkSync(req.file.path);
        if (response === null || response === undefined) {
            return sendError(res, "Error uploading image", 500, null)
        }
        const metadata: imagemetadata = {
            name: `${response.name}`,
            versionInfo: {
                id: `${response.versionInfo?.id || ''}`,
                name: `${response.versionInfo?.name || ''}`
            },
            filepath: `${response.filePath}`,
            fileType: `${response.fileType}`,
            dimensions: {
                width: response.width ? response.width : 0,
                height: response.height ? response.height : 0
            },
            thumbnailUrl: `${response.thumbnailUrl}`
        }
        console.log(metadata);
        console.log(`user : ${req.user}`);
        const user = req.user;
        if (!user || !user.uid) {
            return sendError(res, "User not authenticated", 401, null)
        }
        await User.findOneAndUpdate(
            { uid: user.uid },
            {
                $push: {
                    image: {
                        url: response.url,
                        fieldId: response.fileId,
                        metadata: metadata
                    }
                }
            },
            { new: true }
        )
        return sendSuccess(res, { url: response.url, id: response.fileId }, "Image uploaded successfully", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Internal server error", 500, null)
    }
})
// get image by id
const getImageById = catchAsync(async (req: Request, res: Response) => {
    try {
        const imageId: string | undefined = req.params.id;
        if (!imageId || typeof (imageId) !== 'string') {
            return sendError(res, "Invalid image id", 400, null)
        }
        // getting image from mongoDB by its fieldID 
        const image = await User.aggregate([
            {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageIndex",
                }
            }, {
                $match: {
                    "image.fieldId": imageId
                }
            }, {
                $project: {
                    image: 1,
                }
            }
        ]);
        if (!image) {
            return sendError(res, "Image not found", 404, null)
        }
        return sendSuccess(res, image[0].image, "Image fetched successfully from db", 200)
    } catch (error) {
        console.log(error);
        return sendError(res, "Internal server error", 500, null)
    }
})
// get images in list with pagination
const getImageList = catchAsync(async (req: AuthRequest, res: Response) => {
    try {
        const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const user = req.user as dbuser;
        const images = await User.aggregate([
            {
                $match: {
                    "uid": user.uid,
                },
            }
            , {
                $unwind: {
                    path: "$image",
                    includeArrayIndex: "imageIndex",
                }
            },{
                $skip : ( page - 1 ) * limit 
            }
            , {
                $project: {
                    image: 1
                }
            } , {
                $limit : limit
            }
        ])
        if(!images){
            return sendError(res, "No images found", 404, null);
        }
        return sendSuccess(res, images, "Images fetched successfully", 200)
    } catch (error) {
        console.log(error);
        sendError(res, "Internal server error", 500, null);
    }
})
export {
    reguser as reisterUser,
    loginUser,
    imageUploader,
    getImageById,
    getImageList
}