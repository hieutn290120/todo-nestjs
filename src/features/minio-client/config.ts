const config = {
  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: 9000,
  MINIO_ACCESSKEY: 'minio',
  MINIO_SECRETKEY: 'minio123',
  MINIO_BUCKET: 'admin-site',
};

const directory = {
  ticket: 'ticket',
  coupon: 'coupon',
  stamp: 'stamp',
  banner: 'banner',
  system: 'system',
  temp: 'temp',
};

export enum BucketName {
  AdminSite = 'admin-site',
  RemoteSite = 'remote-site',
}

export { config, directory };
