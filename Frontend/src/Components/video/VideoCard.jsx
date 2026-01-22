import React from "react";
import { Link } from "react-router-dom";
import formatDateTime from "../../utils/CreatedAt";
import secondsToMinutesSeconds from "../../utils/Duration";

function VideoCard({ video, history = false }) {
    // Handle different data structures - owner can be populated or ownerDetails might exist
    const owner = video.owner || video.ownerDetails;
    const avatarUrl = owner?.avatar?.url || (typeof owner?.avatar === 'string' ? owner.avatar : '');
    const ownerId = owner?._id;
    const ownerUsername = owner?.username;
    const thumbnailUrl = video.thumbnail?.url || (typeof video.thumbnail === 'string' ? video.thumbnail : '');

    if (!video || !video._id) {
        return null;
    }

    return (
        <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <div className="relative mb-2 w-full pt-[56%]">
                <Link to={`/watch/${video._id}`}>
                    <div className="absolute inset-0">
                        <img
                            src={thumbnailUrl}
                            alt={video.title || 'Video thumbnail'}
                            className="h-full w-full object-cover cursor-pointer"
                        />
                    </div>
                </Link>
                <span className="absolute bottom-1 right-1 inline-block rounded bg-black px-1.5 text-sm text-white">
                    {secondsToMinutesSeconds(video.duration || 0)}
                </span>
            </div>
            <div className="flex gap-x-2 p-2">
                {owner && (
                    <div className="h-10 w-10 shrink-0">
                        <Link to={"/channel/" + ownerId}>
                            <img
                                src={avatarUrl}
                                alt={ownerUsername || video.title}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </Link>
                    </div>
                )}
                <div className="w-full">
                    <h6 className="mb-1 font-semibold">{video.title}</h6>
                    {!history &&
                    <>
                        <p className="flex text-sm text-gray-500">
                        {video.views || 0} Views, {formatDateTime(video.createdAt)} Ago
                        </p>
                        {owner && (
                            <Link to={`/channel/${ownerId}`}>
                                <p className="text-sm text-gray-500">{ownerUsername}</p>
                            </Link>
                        )}
                    </>
                    }
                </div>
            </div>
        </div>
    );
}

export default VideoCard;
