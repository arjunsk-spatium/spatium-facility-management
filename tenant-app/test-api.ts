import { fetch } from 'ofetch';

async function test() {
    try {
        const res = await fetch('http://spatiumoffices.localhost:4000/api/portal/modules/user/list', {
            headers: {}
        });
        const text = await res.text();
        console.log("Response:", text.substring(0, 500));
    } catch(e) {
        console.error(e);
    }
}
test();
