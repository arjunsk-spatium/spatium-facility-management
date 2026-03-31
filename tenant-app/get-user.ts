import { fetch } from 'ofetch';
async function test() {
    try {
        const res = await fetch('http://spatiumoffices.localhost:4000/api/portal/users/org_portal/list/?app_name=org_portal', {
            headers: {}
        });
        const data = await res.json();
        console.log("Users:", JSON.stringify(data.data?.results?.[0] || data.results?.[0]));
    } catch(e) {
        console.error(e);
    }
}
test();
