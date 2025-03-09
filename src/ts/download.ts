import {ActivityAction, type Book, getFileStatus, loadFile, MimeTypes} from "@the_library/db";
import {ref} from "vue";
import {type RouteLocation, useRoute} from "vue-router";
import { registerNewActivity} from "@//ts/activity.ts";

export const useDownload = (book: Book, route: RouteLocation) => {
    const status = getFileStatus(book.pdf)
    const downloading = ref(false)
    const download = () => {

        downloading.value = true;
        loadFile(book.pdf, MimeTypes.PDF).then(data => {
            const a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(new Blob([data.content], {type: 'application/pdf'}));
            a.download = `${book.name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            downloading.value = false;
            registerNewActivity(ActivityAction.DownloadPdf, book.id)
        })
    }

    return {downloading, download, status}

}