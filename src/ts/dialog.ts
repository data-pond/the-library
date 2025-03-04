import {ref} from 'vue';

export enum Dialog  {
    TagCoverUpload = 'tag-cover-upload',
    TopicManagment= 'topic-managment',
}

export const registerOpened = (id: Dialog) => {
    const opened = ref(false);
    const props = ref(null)
    window.addEventListener('ShowDialog', (evt:CustomEvent) => {
        if (evt.detail.id == id) {
            props.value = evt.detail.props;
            opened.value = true;
        }
    })
    window.addEventListener('HideDialog', (evt: CustomEvent) => {
        if (evt.detail.id == id) {
            opened.value = false;
        }
    })
    return {opened, props}
}

export const showDialog = (id: Dialog, props: any) => {
    const evt = new CustomEvent('ShowDialog', {detail: {id, props}})
    window.dispatchEvent(evt)
}

export const hideDialog = (id: Dialog) => {
    const evt = new CustomEvent('HideDialog', {detail: {id}})
    window.dispatchEvent(evt)
}