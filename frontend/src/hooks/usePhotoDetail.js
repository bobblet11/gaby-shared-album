import { useState, useEffect, useMemo } from "react";

export function usePhotoDetail() {
        const [openPhoto, setOpenPhoto] = useState(null);
        const [editDraft, setEditDraft] = useState(null);
        const [isEditingPhoto, setIsEditingPhoto] = useState(false);

        useEffect(() => {
                if (openPhoto) {
                        setEditDraft({
                                title: openPhoto.title ?? "",
                                caption: openPhoto.caption ?? "",
                                image_src: openPhoto.image_src ?? ""
                        });
                } else {
                        setEditDraft(null);
                }
        }, [openPhoto]);

        const samePhoto = (a, b) => {
                if (!a || !b) return false;
                return a.title === b.title && a.caption === b.caption && a.image_src === b.image_src;
        };

        const isDirty = useMemo(() => {
                if (!openPhoto || !editDraft) return false;

                return !samePhoto(
                        {
                                title: openPhoto.title ?? "",
                                caption: openPhoto.caption ?? "",
                                image_src: openPhoto.image_src ?? "",
                        },
                        editDraft,
                );
        }, [openPhoto, editDraft]);

        const updateTitle = (e) => {
                setEditDraft((prev) => ({ ...prev, title: e.target.value }));
        };

        const updateCaption = (e) => {
        	setEditDraft((prev) => ({ ...prev, caption: e.target.value }));
        };

        const onOpenPhoto = (photo) => {
                if (openPhoto && photo.image_src === openPhoto.image_src) {
                        return;
                }
                setOpenPhoto(photo);
        };

        const onClosePhoto = () => {
                setOpenPhoto(null);
        };

        const onEnterEdit = () => {
                setIsEditingPhoto(true);
        };

        const onExitEdit = () => {
                setEditDraft({
                        title: openPhoto.title ?? "",
                        caption: openPhoto.caption ?? "",
                        image_src: openPhoto.image_src ?? "",
                });
                setIsEditingPhoto(false);
        };

        return { openPhoto, editDraft, isEditingPhoto, isDirty, onOpenPhoto, onClosePhoto, onEnterEdit, onExitEdit, updateTitle, updateCaption };
}
