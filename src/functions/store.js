import Store from "electron-store";

const store = new Store(
    {
        name: "userdata",
        encryptionKey: "antoninocannavacciuolo"
    });

export default store;