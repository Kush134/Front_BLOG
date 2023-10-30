export interface ResponseDto<Data> {
    status: 'success' | 'error',
    data: Data
}