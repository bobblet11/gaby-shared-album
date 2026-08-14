import client from "./client";

export const getAllPhotos = async () => {
        const res = await client.get(`/api/photos/`);
        return res.data;
};

export const getPhotoById = async (id) => {
        const res = await client.get(`/api/photos/${id}`);
        return res.data;
};

// UPLOAD: formData = {title, caption, image}
export const uploadPhoto = async (formData) =>
        client.post(`/api/photos/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
        });

export const deletePhoto = async (filename) => {
        const res = await client.delete(`/api/photos/${filename}`);
        return res.data;
};
// EDIT: data = {title, caption}
export const editPhoto = async (filename, data) => {
        const res = await client.put(`/api/photos/${filename}`, data);
        return res.data;
};

export const getImageBlob = async (imageUrl) => {
        const res = client.get(imageUrl, {
                responseType: "blob",
                baseURL: "",
        });
        return res.data;
};
