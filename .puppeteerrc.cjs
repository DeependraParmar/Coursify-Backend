import {join} from "path"

export default config = {
    cacheDirectory: join(process.cwd(), '.cache', 'puppeteer')
}