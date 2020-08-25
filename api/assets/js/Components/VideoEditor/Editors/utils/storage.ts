export default class Storage {
    name: string

    constructor() {
        this.name = 'subplayer_settings'
    }

    get(key?: string) {
        const itemInLocalStorage = window.localStorage.getItem(this.name)
        const storage = itemInLocalStorage ? JSON.parse(itemInLocalStorage) : {}

        return key ? storage[key] : storage
    }

    set(key: string, value: Object): void {
        const storage = Object.assign({}, this.get(), {
            [key]: value,
        })
        window.localStorage.setItem(this.name, JSON.stringify(storage))
    }

    del(key: string): void {
        const storage = this.get()
        delete storage[key]
        window.localStorage.setItem(this.name, JSON.stringify(storage))
    }

    clean(): void {
        window.localStorage.removeItem(this.name)
    }
}
