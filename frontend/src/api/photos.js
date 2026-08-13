import client from "./client"

export const getAllPhotos = () => client.get(`/api/photos/`);
export const getPhotoById = (id) => client.get(`/api/photos/${id}`);

// UPLOAD: data = {title, caption, files}
export const uploadPhoto = (data) => client.post(`/api/photos/`, data);
export const deletePhoto = (filename) => client.delete(`/api/photos/${filename}`);

// EDIT: data = {title, caption}
export const editPhoto = (filename, data) => client.put(`/api/photos/${filename}`, data);
