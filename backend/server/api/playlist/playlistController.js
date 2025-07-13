const Playlist = require("./playlistModel.js");
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { title, videoLinks, subjectId, isPublic } = req.body;
        const trimmedTitle = title?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedTitle) errors.title = "Playlist title is required";
        if (!videoLinks) errors.videoLinks = "Video links are required";
        if (!subjectId) errors.subjectId = "Subject id is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Playlist (case-insensitive + same subject)
        const existingPlaylist = await Playlist.findOne({
            title: {
                $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            },
            subjectId
        });

        if (existingPlaylist) {
            return res.status(409).json({
                success: false,
                message: "Playlist with this title already exists for the subject",
                existingPlaylist
            });
        }

        const count = await Playlist.countDocuments();
        // 3. Save Playlist
        const videoLinksArray = typeof videoLinks === 'string' ?
            videoLinks.split(',').map(link => link.trim()) :
            videoLinks;

        const newPlaylist = new Playlist({
            title: trimmedTitle,
            videoLinks: videoLinksArray,
            subjectId,
            isPublic: isPublic || false,
            addedById: req.user,
            autoId: count + 1
        });

        const savedPlaylist = await newPlaylist.save();

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: savedPlaylist
        });

    } catch (err) {
        return sendError(res, 500, "Failed to add playlist");
    }
};

const getAll = async (req, res) => {
    try {
        // Safely extract filters
        const filters = { ...req.body };
        const allowedFilters = ['title', 'subjectId', 'status', 'isPublic', 'addedById'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'title' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        const playlists = await Playlist.find(safeFilters)
            .populate('subjectId')
            .populate('addedById');

        const total = await Playlist.countDocuments(safeFilters);

        return res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            total,
            data: playlists
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch playlists");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const playlist = await Playlist.findById(id)
            .populate('subjectId')
            .populate('addedById');

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            data: playlist
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch playlist");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find playlist
        const playlist = await Playlist.findById(id);
        if (!playlist) return sendError(res, 404, "Playlist not found");

        // Prepare updates
        const allowedUpdates = ['title', 'videoLinks', 'subjectId'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                if (key === 'title') {
                    acc[key] = updates[key].trim();
                } else if (key === 'videoLinks') {
                    acc[key] = typeof updates[key] === 'string' ?
                        updates[key].split(',').map(link => link.trim()) :
                        updates[key];
                } else {
                    acc[key] = updates[key];
                }
            }
            return acc;
        }, {});

        // Handle title uniqueness if changed
        if (updatedFields.title && updatedFields.title !== playlist.title) {
            const existingPlaylist = await Playlist.findOne({
                title: { $regex: new RegExp(`^${updatedFields.title}$`, 'i') },
                subjectId: updatedFields.subjectId || playlist.subjectId,
                _id: { $ne: id }
            });

            if (existingPlaylist) {
                return sendError(res, 409, "Playlist with this title already exists for the subject");
            }
        }

        // Apply updates
        Object.assign(playlist, updatedFields);
        await playlist.save();

        // Populate before response
        const populatedPlaylist = await Playlist.findById(playlist._id)
            .populate('subjectId')
            .populate('addedById');

        return res.status(200).json({
            success: true,
            message: "Playlist updated successfully",
            data: populatedPlaylist
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update playlist");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const playlist = await Playlist.findByIdAndDelete(id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            data: playlist
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete playlist");
    }
};

const changeStatus = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { id } = req.params;
        const { status } = req.body;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }
        if (status === undefined) {
            return sendError(res, 422, "Status is required");
        }

        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        playlist.status = status;
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist status updated successfully",
            data: playlist
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update playlist status");
    }
};

const changePublicStatus = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { id } = req.params;
        const { isPublic } = req.body;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }
        if (isPublic === undefined) {
            return sendError(res, 422, "isPublic is required");
        }

        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        playlist.isPublic = isPublic;
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist public status updated successfully",
            data: playlist
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update playlist public status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [playlists, total] = await Promise.all([
            Playlist.find()
                .populate('subjectId')
                .populate('addedById')
                .skip(skip)
                .limit(limit),
            Playlist.countDocuments()
        ]);

        if (playlists.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: playlists
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch playlists");
    }
};

module.exports = {
    add,
    getAll,
    getSingle,
    update,
    deleteOne,
    changeStatus,
    changePublicStatus,
    pagination
};