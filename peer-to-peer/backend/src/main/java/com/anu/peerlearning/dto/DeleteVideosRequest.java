package com.anu.peerlearning.dto;

import java.util.List;
import javax.validation.constraints.NotEmpty;

public class DeleteVideosRequest {

    @NotEmpty(message = "Video IDs are required")
    private List<Long> videoIds;

    public DeleteVideosRequest() {}

    public DeleteVideosRequest(List<Long> videoIds) {
        this.videoIds = videoIds;
    }

    public List<Long> getVideoIds() {
        return videoIds;
    }

    public void setVideoIds(List<Long> videoIds) {
        this.videoIds = videoIds;
    }
}
