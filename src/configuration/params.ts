interface CouponUsageQuery {
  organizationId: {
    value: string; // Giá trị của parentId.
  };
  couponName?: {
    value: string; // Tìm kiếm theo tên coupon.
  };
  couponCode?: {
    value: string; // Tìm kiếm theo mã coupon.
  };
  organizationName?: {
    value: string; // Tìm kiếm theo tên tổ chức.
  };
  limit?: number; // Giới hạn số lượng kết quả.
  offset?: number; // Vị trí bắt đầu lấy kết quả.

  outputLocation?: string; // Đường dẫn lưu trữ kết quả.
  iamRoleArn?: string; // ARN của IAM role.

  groupBy?: {
    value: string; // Tên trường cần group by.
  };
}

const paramsQ5: CouponUsageQuery[] = [
  {
    organizationId: {
      value: "8219ca6d-38a1-447f-a59a-6b9cdee52985",
    },
    couponName: {
      value: "2311",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf",
    },
    couponCode: {
      value: "0001",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf",
    },
    couponCode: {
      value: "0003",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "228575b5-1bc6-4eaa-917b-10fc52a11fb9",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "228575b5-1bc6-4eaa-917b-10fc52a11fb9",
    },
    couponName: {
      value: "本番",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a",
    },
    couponCode: {
      value: "tokyo-sento",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "153d75fa-61f1-4ea0-bd73-33ad14b99c87",
    },
    couponCode: {
      value: "030034007",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a",
    },
    couponName: {
      value: "tokyo-sento",
    },
    limit: 100,
    offset: 0,
  },
  {
    organizationId: {
      value: "8219ca6d-38a1-447f-a59a-6b9cdee52985",
    },
    couponName: {
      value: "2311",
    },
    limit: 100,
    offset: 100,
  },
];

const paramsQ6: CouponUsageQuery[] = [
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/1da70939-2558-442d-8f00-efbdc60ddda3/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    couponCode: { value: "tokyo-sento" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/6093a4e6-9734-48ba-83c3-03bd7e43fb8a/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "966b73e3-c8b2-4305-a1bc-24de6bb4748f" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/6bcece6e-3477-4858-84fb-cd02b3937a19/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    couponCode: { value: "0001" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/8168d505-bcff-43c0-b4a9-499963677f81/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    couponCode: { value: "sento" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/f4e5fd67-bf68-4af5-84b8-06619d528094/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    couponCode: { value: "art-ishigakijima-samplecoupon1" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/ab460228-d916-4d74-baab-3518ca8ae4b2/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    organizationName: { value: "SBギフト" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/0adcde8f-9dd6-4c06-bae3-6faab886bc59/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "153d75fa-61f1-4ea0-bd73-33ad14b99c87" },
    couponName: { value: "KC1094" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/b799caa9-60df-4baf-b761-31c97d18ab52/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "1673ced4-18f3-449a-a621-160b3f678499" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/9a2adfdd-81a7-4d04-ba5d-6a019f55c3dd/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "6b8a558d-bf01-4d1a-87d8-2e7a62ae85e0" },
    couponCode: { value: "ACLE1105" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/4a181ca0-7437-4381-9382-d3432d236a57/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
];

const paramsQ7: CouponUsageQuery[] = [
  {
    organizationId: { value: "d634f7c1-f232-4abc-b4dc-5a7c8dbbca6e" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "8219ca6d-38a1-447f-a59a-6b9cdee52985" },
    groupBy: { value: "SHOP" },
    couponCode: { value: "%ichibanya%" },
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    groupBy: { value: "SHOP" },
    couponCode: { value: "%tokyo-sento%" },
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "228575b5-1bc6-4eaa-917b-10fc52a11fb9" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: { value: "%200%" },
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "1673ced4-18f3-449a-a621-160b3f678499" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    groupBy: { value: "SHOP" },
    couponCode: { value: "%0001%" },
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "966b73e3-c8b2-4305-a1bc-24de6bb4748f" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    groupBy: { value: "SHOP" },
    couponCode: null,
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
  {
    organizationId: { value: "a998e975-6bfd-40f3-8a64-4e489a6b7cc5" },
    groupBy: { value: "SHOP" },
    couponCode: { value: "%kobe%" },
    couponName: null,
    limit: { value: 100 },
    offset: { value: 0 },
  },
];

const paramsQ8: CouponUsageQuery[] = [
  {
    organizationId: { value: "7b012f01-1362-4f92-8cbd-83bdb69ccd28" },
    groupBy: { value: "SHOP" },
    organizationName: undefined, // Không có điều kiện LIKE tên tổ chức
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "966b73e3-c8b2-4305-a1bc-24de6bb4748f" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "a998e975-6bfd-40f3-8a64-4e489a6b7cc5" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "7b012f01-1362-4f92-8cbd-83bdb69ccd28" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 100,
  },
  {
    organizationId: { value: "84f4ee9e-3f00-4530-adaf-9bd2dc15108b" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "e40b822d-2c9d-4060-9a4a-e9c82cb9da98" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
  {
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 100,
  },
  {
    organizationId: { value: "d2f8c6ac-ebde-41c7-a0d8-ca34dfa397db" },
    groupBy: { value: "SHOP" },
    organizationName: undefined,
    limit: 100,
    offset: 0,
  },
];

const paramsQ9: CouponUsageQuery[] = [
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    couponCode: { value: "tokyo-sento" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/19c33f25-f622-4c6f-81a0-58ca51b517ae/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/71a4fd80-711a-4df1-8887-a271dbdd2927/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "8219ca6d-38a1-447f-a59a-6b9cdee52985" },
    couponCode: { value: "ichibanya" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/14967b59-0df9-45d8-b8ff-2a0ba73c8f60/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "d634f7c1-f232-4abc-b4dc-5a7c8dbbca6e" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/6e7a9534-a97a-41aa-a12b-1d2e8593112c/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "1673ced4-18f3-449a-a621-160b3f678499" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/f7377481-2b85-4d59-a2d5-cbb016c13af7/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "6b8a558d-bf01-4d1a-87d8-2e7a62ae85e0" },
    couponCode: { value: "ACLE1105" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/599a6189-f78e-472f-9803-8f2643893e74/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "228575b5-1bc6-4eaa-917b-10fc52a11fb9" },
    couponName: { value: "200" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/87a53d28-5d15-4249-a10a-c8d94677140f/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "e32094fb-c933-4c35-b1db-b03faa2e2d7a" },
    couponName: { value: "帰ってきた" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/ed94cca0-fdc2-420c-a718-b0e1822b979f/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "e99ecb04-e950-4cd3-a384-0fbaeeabd227" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/b9360d97-f2eb-4ae6-b951-4ebcec8da360/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    couponCode: { value: "jichi" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/3fec7427-a9b2-4e3e-9d7b-12516ccac8ed/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
];

const paramsQ10: CouponUsageQuery[] = [
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "7b012f01-1362-4f92-8cbd-83bdb69ccd28" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/11fb5920-dd80-4c01-b000-95b34e588989/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "966b73e3-c8b2-4305-a1bc-24de6bb4748f" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/9123ee7f-42af-42b3-906e-1ea0ceec0988/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "BIG_SHOP_GROUP" },
    organizationId: { value: "dcdaf32b-1480-4f98-9816-f35b349d6310" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/989f87a7-d635-4ccf-a76d-8c2886f8c7c2/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "2d604e05-5c13-423f-ae98-7f29dc5cc1cf" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/626d4f4a-9c6e-4a5e-9ecc-af548ec2b6c3/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "0a30b1f7-eabb-48f3-b70c-d10264da9e2a" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/72fa5163-d5a2-4886-b5b2-41c0a4f2996f/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "a998e975-6bfd-40f3-8a64-4e489a6b7cc5" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/7a5aab76-3331-44c1-806a-ce544da6875d/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "d4e3ccff-215e-4bf3-b85b-d120b1e75278" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/bb709c96-3939-4cdc-aeb4-50e16efa1f67/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "e40b822d-2c9d-4060-9a4a-e9c82cb9da98" },
    organizationName: { value: "上野マルイ" },
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/c08a0652-4a34-4126-a5c6-46d27de5f660/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "e99ecb04-e950-4cd3-a384-0fbaeeabd227" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/23cc76a5-1c04-4ed2-8c8f-145e64b5aaa8/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
  {
    groupBy: { value: "SHOP" },
    organizationId: { value: "f0e001ee-52da-42fa-8929-8227d3947a74" },
    organizationName: null,
    outputLocation:
      "s3://prd-coupon-redshift-bucket-ap-northeast-1-856562439801/4daa5fae-e23e-4a2e-ac2f-67e04b1948ba/",
    iamRoleArn: "arn:aws:iam::856562439801:role/coupon-redshift-cluster-role",
  },
];
