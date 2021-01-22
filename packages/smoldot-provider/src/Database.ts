export default interface Database {
    save: (state: string) => void;
    delete: () => void;
}