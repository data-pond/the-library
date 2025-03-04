import {ref} from "vue";
import {connect} from "@permaweb/aoconnect";

export const initAoAccount = (wallet: any) => {
    const connection = connect({})
    const {result, results, message, spawn, monitor, createDataItemSigner, unmonitor, dryrun} = connection

    const signer = createDataItemSigner(wallet)
// The only 2 mandatory parameters here are process and signer
    return message({
        process: "sqBtdO15caCOIwIO-lfy0-D0x9_iighQFEId_AOETWk",
        tags: [
            {
                name: "Action",
                value: "Register"
            }
        ],
        signer,
        data: "any data",
    }).then(response => result({
        process: "sqBtdO15caCOIwIO-lfy0-D0x9_iighQFEId_AOETWk",
        message: response
    })).then((status) => {
        console.log('status', status);
    }).catch(e => {
        console.error(e);
        throw e
    })



}
