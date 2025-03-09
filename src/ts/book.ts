import {computed, type ComputedRef, type Ref, ref, watchEffect} from "vue";
import {
    Book,
    type BookData,
    DateUtils,
    DownloadState,
    DownloadTagBookCovers,
    DSafeGenericFilter,
    getFile,
    getFileStatus,
    getMuStatus,
    getPdfWorkerSettings,
    LoadPdfPage,
    MimeTypes,
    ProcessPdf,
    storeLocalFile
} from "@the_library/db";
import {addInvalidBookCover, isInvalidCover} from "@//db";
import {type Router} from "vue-router";

export const useBookList = (bookIds: Array<number>) => {
    const books = computed(() =>bookIds.filter((id: number) => DSafeGenericFilter(id, Book.type)).map((id: number) => Book.Load(id)))
    const status = new Map<string, Ref<DownloadState>>();
    watchEffect((() => {
        books.value.forEach(book => {
            getFile(book.coverImage, MimeTypes.IMAGE).catch(console.error)
            status.set(book.pdf, getFileStatus(book.pdf));
        })
    }))




    const bookAction = (bookid: number) => {

        const book = Book.Load(bookid)
        const bookStatus = status.get(book.pdf).value

        console.log('Book Status', bookStatus, book)

        switch (bookStatus) {
            case  DownloadState.Done:
                return true
                break;
            case DownloadState.Error:
                alert("This book PDF is broken")
                return true
                break
            default: {
                getFile(book.pdf, MimeTypes.PDF).catch(console.error)
                return true
            }
        }
    }

    return {books, status, bookAction}
}

export const useAccessBook = (book: ComputedRef<Book>) => {
    const pdfSettings = getPdfWorkerSettings()
    const invalidCover = ref(false)

    isInvalidCover(book.value.id).then(valid => {
        invalidCover.value = valid;
    });

    const pdfStatus: Ref<BookData> = getMuStatus(book.value.pdf);
    const max = book.value.nbPages<pdfSettings.to ? book.value.nbPages : pdfSettings.to

    const pdfParsed = (dimensions: Array<any>) => {
        for (let i=0; i<max; i++) {
            if (dimensions[i] == null) {
                return false
            }
        }
        return true
    }

    const allPagesReady = computed(() => {
        return pdfStatus.value!==null && pdfParsed(pdfStatus.value.dimensions)
    })

    const pdfFileStatus = getFileStatus(book.value.pdf)

    let _processingPdf = false
    const processPdf = () => {
        if (_processingPdf) {
            return
        }
        console.log('Calling ProcessPdf')
        _processingPdf = true
        ProcessPdf(book.value.pdf).then(() => {
            console.log('PDF PROCESSED')
        }).catch(e => {console.error(e)})
    }

    if (pdfFileStatus.value!=DownloadState.Done) {
        getFile(book.value.pdf, MimeTypes.PDF)
    }

    if (!allPagesReady.value && pdfFileStatus.value === DownloadState.Done) {
        processPdf()
    }

    const markInvalid = () => {
        invalidCover.value = true
        processPdf()
        addInvalidBookCover(book.value.id)
    }
    const selectedIndex = ref(null)
    if (book.value.coverImage.startsWith('Book_local')) {
        selectedIndex.value = parseInt(book.value.coverImage.split('_')[2])
    }
    const loading = ref(false)
    const setPage = (index: number) => {
        selectedIndex.value = index
        loading.value = true
        LoadPdfPage(book.value.pdf, index-1).then((data: any) => {
            console.log('Loaded page', index, data)
            storeLocalFile({
                local: true,
                content: data.content,
                mime: MimeTypes.IMAGE,
                creationTime: DateUtils.now(),
                id: `Book_local_${index-1}_${book.value.id}`,
                sizeKb: Math.ceil(data.content.byteLength / 1024)
            }).then(() => {
                book.value.coverImage = `Book_local_${index-1}_${book.value.id}`
                loading.value = false
            })
        })
    }

    return {
        isInvalid: invalidCover,
        allPagesReady,
        pdfFileStatus,
        selectedIndex,
        loading,
        setPage,
        markInvalid,
        max
    }
}