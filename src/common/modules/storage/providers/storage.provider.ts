export interface StorageProvider{
    uploadBuffer(file: Buffer, sum: string): void;
    uploadStream(file: ReadableStream, sum: string): void;
    removeFile(sum: string): void;
    getBuffer(sum: string): Buffer;
    getStream(sum: string): ReadableStream;
    list(take: number, skip: number): string[];
}
