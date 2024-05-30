import https from 'https'

export async function getUserInfo(config) {

    const mimicEasyAuthHeader = parseInt(config.viteMimicEasyAuthHeader) || 0;
    console.log("mimic", config.viteMimicEasyAuthHeader)
    if (mimicEasyAuthHeader) {
        return JSON.parse(
            '[{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJhcGk6Ly85OGQ1NmI1OC0yOTdjLTQ0MGMtODMyNC1hNWQ1MTM2Y2M3NjMiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8wZjYzNGFjMy1iMzlmLTQxYTYtODNiYS04ZjEwNzg3NmM2OTIvIiwiaWF0IjoxNjg1NTc5NjA0LCJuYmYiOjE2ODU1Nzk2MDQsImV4cCI6MTY4NTU4Mzk4NSwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQXBvZVNJaEF3cjMwZzlzdGwzVnI5YmY3a203NVhjRE5lQis0aTdDckV2ZUNpZlVuRjdIbFcwc2xJenhuWVpnQnp3SEorZ2gvMitxNHkvQ2pZT2FqUmtqT0oyMmRZNnh3SU5lOGZhckZPOGRJPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiIxZGU5ZjFjNi0wNmYyLTRjNGEtOGRjOC0zYzlhYTk3NGRhMGQiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6IkJhcnVhaCIsImdpdmVuX25hbWUiOiJSZWV0dXJhaiIsImlwYWRkciI6IjE3My4xODUuMTU4LjE2OSIsIm5hbWUiOiJCYXJ1YWgsIFJlZXR1cmFqIiwib2lkIjoiYTAzMzdjZmEtZjdmMi00ZDMyLWJlYmItNTQyZDExNzMyMjQzIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEwNzgwODE1MzMtOTYzODk0NTYwLTgzOTUyMjExNS0zODU3NjMiLCJyaCI6IjAuQVJjQXcwcGpENS16cGtHRHVvOFFlSGJHa2xocjFaaDhLUXhFZ3lTbDFSTnN4Mk1YQVBZLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6ImFQNzRSa01iaGxjcVhTXzRyd3Y2eG9XendzeDZjUU5iNU1RdjlKT3NjeG8iLCJ0aWQiOiIwZjYzNGFjMy1iMzlmLTQxYTYtODNiYS04ZjEwNzg3NmM2OTIiLCJ1bmlxdWVfbmFtZSI6InJlZXR1cmFqLmJhcnVhaEBmb3J0aXZlLmNvbSIsInVwbiI6InJlZXR1cmFqLmJhcnVhaEBmb3J0aXZlLmNvbSIsInV0aSI6IlEzX2FOOTB2MzBxbF9OOXptZ19JQUEiLCJ2ZXIiOiIxLjAifQ.DkKm9DDVB3zg1pqpGFKCxNe32scMOcu4YUSBGc3LLW8HZ_IjN7YZVrozWLWR64Iptix2A3b-T3bPykHU38IShOVjQuyOYGZ8zP8Jl5aD2djmLeOUxc5PDjbIGkJtnFnmHA1aK48uyiYdmBG0oTqX6RMyz4M0ZzqitaMJsP1boYwRhyrDyWTlpWO-sRwzyGix7UnMYi_7MlBCbkygRZXIfthFQp-cvUP_933nivTY7NZSZqSJ-THESQi3-EDBqiT3JYZ9eRXURBbyYvV1Obc8SlTmS_PPaRdG6WJzlifhJfzJBvFI3lGiLsNV6y4B__205VK-TSAyCC9S35rhcm6r7Q","expires_on":"2023-06-01T01:46:24.2750691Z","id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIxZGU5ZjFjNi0wNmYyLTRjNGEtOGRjOC0zYzlhYTk3NGRhMGQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMGY2MzRhYzMtYjM5Zi00MWE2LTgzYmEtOGYxMDc4NzZjNjkyL3YyLjAiLCJpYXQiOjE2ODU1Nzk2MDQsIm5iZiI6MTY4NTU3OTYwNCwiZXhwIjoxNjg1NTgzNTA0LCJhaW8iOiJBV1FBbS84VEFBQUFZc2JERzI0T0NLREJreHFHVmFpZWVSL2FRSlp5d3owSSs2dUtNWnBIYlFTRjdVSGpBUjRJb0xYNXJVd0JRbFEza3hoV0p5VEZNbFBRYklLYzdiN0x6Vk1lY2xrTHVha29FOU45WXBxclhhQzIrSkVxWUozaWRVYVRjVjVUVStnUiIsIm5vbmNlIjoiZWQ1YWE1ZGE0MjAyNGU1YjhkNDk4MTlmYTk4OWM4YzVfMjAyMzA2MDEwMDQzMTciLCJyaCI6IjAuQVJjQXcwcGpENS16cGtHRHVvOFFlSGJHa3NieDZSM3lCa3BNamNnOG1xbDAyZzBYQVBZLiIsInN1YiI6ImI3dU8wNm1mUzlDQW82cmM0V0lHRWtpc3MtX2V1NmMtTFI3ZFpKVlBYVUkiLCJ0aWQiOiIwZjYzNGFjMy1iMzlmLTQxYTYtODNiYS04ZjEwNzg3NmM2OTIiLCJ1dGkiOiJRM19hTjkwdjMwcWxfTjl6bWdfSUFBIiwidmVyIjoiMi4wIn0.TunmxQE69_HWl6SeS479gmWaxgK3zVljXcdQ91c9TQKDCq5W7MYO25c1tQyHc6xANnhm5B7QdIqV2_xO_h1lb_lTzJsMbZNCW3yBiobapFczho1GXyV8DNcQvuHP6D0mEnLMMtvJRXeoDbFGM60flPww4p1GAE3DQSYH_WBlJsY18KpIH748RfomhqN37E5qNENh8GX8W_m2XjPjhNLW9Er_KZtnD8O7XhF_sx7P4Otj7o_lSKTLOYIhe_BkfetP7q-rbQJDSqXYr2a4SfLiaZE5mVqq97Q0j7JZWomnMLlyGVWroX8uTDevDl1q7GPgjw691d0d7TMgi1Oay0qHNQ","provider_name":"aad","refresh_token":"0.ARcAw0pjD5-zpkGDuo8QeHbGksbx6R3yBkpMjcg8mql02g0XAPY.AgABAAEAAAD--DLA3VO7QrddgJg7WevrAgDs_wUA9P9DdayjOpaorLQbhCsOgeBwTXLMSWIWOYud58Uxz7k8LVMGTwQ6VK-yna4Qx1paY0grj03ym8OL-O_DepjPjtaXE38nh7VyLSJaS0cXfTu1zs8viw5nbNOHR1ybhPhxAj2lujjIw7V6t0b8r-x6xMHClfeXGPF6CHBN6xiEdsDFKs9VeC9jjbd5KDs5Gb1VXes4LZPTF4c7gIrMPLzvtgWTKGGmAP_Cv-S0pRKPMg6LfHppzd746WEOlmoa9GvqA1P5oPSa89eKA4TfCM6X2NRYoe3L7qCKnxKyzhgeB7umYt6TqM_bPpXz22pnIHteEK8H0A7eoqaN6IH0kpiWyJPJP3lv8oGKrw1u75a2b-jIATaE-G2dNredtDvdl-4IfK3H_aAkDxgagF6Iez5Vs_hMCwneTt81Vy5Vtu7ktQt5U0csYh2DcWRkBcDfbTHf1Le2P3DUUgGmXwdFkSC8cF0ZHdMii3-HWyjFBk7nuaLFCNXssU8Hv1zR4xRevAFKB-swUdp_Yb0b7bN7UgWjhgxelRh_dwsBId9pb41sBnp0OuX2y0AQtW_d30tJFrOHA9pSqYZMmXeQbErHylQKPkyNW8pVbhdzygCejLm1pWb1Yhl6eIz_l_suocVfK1mODlqguh7rJIrGGVjKyg8stUMyEjIOXl27VYzQJwLlJE2Dn4HZ4q_xQ6h7pkHDt9LIZpCWjZj7jQqXOP8IZLDUySQWczh9UxrHleU3wlJEzS8OLIgwzEmVBbUOFgnENcpZSiKJgvtWr7BQqoeHMVjWwj4vTAQmkXdiFUQGa289cNgR-vm9DogBgH1N3K8ABGuCS-qg4HRBNnDYpa6QW0kB79RMXzeG_x4L-rJbz75mXLN9mQH5vEPI3dEY8LaX4yjVe6L437sBlZNkXzo","user_claims":[{"typ":"aud","val":"1de9f1c6-06f2-4c4a-8dc8-3c9aa974da0d"},{"typ":"iss","val":"https://login.microsoftonline.com/0f634ac3-b39f-41a6-83ba-8f107876c692/v2.0"},{"typ":"iat","val":"1685579598"},{"typ":"nbf","val":"1685579598"},{"typ":"exp","val":"1685583498"},{"typ":"aio","val":"AWQAm/8TAAAA37b3HlPRVS6Gvsi/mUGXRzxSo0r62pAUkYAeDFkhbGpjsiscE20JfVLbZSkVFbQzzb4nI0KzzQgG+lYxk08IYa/lKrJxX1ZLvJKp2jHHgZvcmeaRT4EKRfy5HEJXvLr6"},{"typ":"c_hash","val":"0frkZu_qjc61ViKz_t2Y0A"},{"typ":"nonce","val":"ed5aa5da42024e5b8d49819fa989c8c5_20230601004317"},{"typ":"rh","val":"0.ARcAw0pjD5-zpkGDuo8QeHbGksbx6R3yBkpMjcg8mql02g0XAPY."},{"typ":"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier","val":"b7uO06mfS9CAo6rc4WIGEkiss-_eu6c-LR7dZJVPXUI"},{"typ":"http://schemas.microsoft.com/identity/claims/tenantid","val":"0f634ac3-b39f-41a6-83ba-8f107876c692"},{"typ":"uti","val":"EiyzY-IkmEO6WDYlawklAA"},{"typ":"ver","val":"2.0"}],"user_id":"b7uO06mfS9CAo6rc4WIGEkiss-_eu6c-LR7dZJVPXUI"}]'
        )[0];
    }

    let response = await fetch("/.auth/me");
    let isAuthenticated = false;
    if (
        response.ok &&
        response.headers.get("content-type")?.includes("application/json")
    ) {
        // get the payload, which will be a list of json objects
        let payload = await response.json();
        // get the token expiry if available
        let exp = 0;
        if (payload.length > 0 && payload[0].expires_on) {
            exp = Date.parse(payload[0].expires_on);
        }
        let now = Date.now();
        // if the list is empty, or if the token has expired, we need to refresh the token
        if (payload.length === 0 || now > exp) {
            let refreshResponse = await fetch("/.auth/refresh");
            if (refreshResponse.ok) {
                response = await fetch("/.auth/me");
                console.log("Access token after Refresh: " + response);
                if (
                    response.ok &&
                    response.headers
                        .get("content-type")
                        ?.includes("application/json")
                )
                    payload = await response.json();
                isAuthenticated = true;
                return payload[0];
            }
        } else {
            isAuthenticated = true;
            return payload[0];
            console.log("authenticated true")
        }
    }
    if (!isAuthenticated) {
        //alert("Please login again...");
        console.log("Please login again")
        https.request(serverBase, (res) => {
            let location = "/.auth/login/aad"
            const loginUrl = new URL(location);
            console.log(`Redirecting to ${loginUrl}`);
        }).end();
    }

}