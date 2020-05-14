/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: VideoList
// ====================================================

export interface VideoList_videos_edges_node {
  __typename: "Video";
  _id: string;
  title: string;
}

export interface VideoList_videos_edges {
  __typename: "VideoEdge";
  node: VideoList_videos_edges_node | null;
}

export interface VideoList_videos {
  __typename: "VideoConnection";
  edges: (VideoList_videos_edges | null)[] | null;
}

export interface VideoList {
  videos: VideoList_videos | null;
}

export interface VideoListVariables {
  title: string;
}
