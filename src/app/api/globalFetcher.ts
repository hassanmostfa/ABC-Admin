// SWR fetcher function

// Base URL for all API requests
const API_BASE_URL = "https://api.abc-juice-kw.com/api";

// Helper function to build full URL
const buildUrl = (endpoint: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

const getFetcher = (url:any) => fetch(buildUrl(url),{
    method:"GET",
    headers:{'browserrefreshed':'false'},
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to fetch the data")
    }
    return res.json()
});


const postFetcher = (url:string,arg:any) => fetch(buildUrl(url),{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(arg)
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to post data")
    }
    return res.json()
});

const putFetcher = (url:string,arg:any) => fetch(buildUrl(url),{
    method:"PUT",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(arg)
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to updated data")
    }
    return res.json()
});

const patchFetcher = (url:string,arg:any) => fetch(buildUrl(url),{
    method:"PATCH",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(arg)
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to updated data")
    }
    return res.json()
});

const deleteFetcher = (url:string , arg:any) => fetch(buildUrl(url),{
    method:"DELETE",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(arg)
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to delete data")
    }
    return res.json()
})

export {getFetcher,postFetcher,putFetcher,deleteFetcher, patchFetcher, API_BASE_URL}