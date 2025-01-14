import {
    Factory as ValidatorFactory,
    ValidationResult,
} from '@cm-madlabs/ts-validator';
import { Checkable } from '../../../libs/checkable';
import {
    CouponCode,
    CouponName,
    OrganizationId,
} from '../../coupon-master/domains/coupon-master';
import { CouponUsage, OrganizationName } from './coupon-usage';
import { Page, Limit, Offset } from '../../../libs/query';
import { CouponUsageLog } from './coupon-usage-log';

/**
 * Group BY がとりうる文字列
 */
export type GroupByString =
    | 'COUPON_MASTER'
    | 'SHOP'
    | 'SMALL_SHOP_GROUP'
    | 'BIG_SHOP_GROUP';

/**
 * クエリ発火の戻り。実行IDのみ
 */
export type InvokeQueryResult = {
    queryExecutionId: string;
};

/**
 * クエリ状態をポーリングしたときに得られる結果
 */
export type QueryStatus = {
    queryExecutionId: string;
    status: string;
    outputLocation?: string;
};

/**
 * FetchMore 時に得られる結果
 */
export type FetchMoreQueryInput = {
    limit?: number;
};

/**
 * GroupBy の入力型
 */
export type GroupByInput = {
    groupBy: GroupByString;
};

/**
 * 更に読み込むのためのクエリ
 */
export class FetchMoreQuery {
    limit: Limit;

    static of(input: FetchMoreQueryInput): FetchMoreQuery {
        const obj = new FetchMoreQuery();
        obj.limit = new Limit(input.limit ? input.limit : Limit.defaultLimit);

        return obj;
    }

    validateAll(): ValidationResult[] {
        function can(arg: Checkable): arg is Checkable {
            return (arg as Checkable).check !== undefined;
        }

        return Object.values(this)
            .filter((v) => v !== undefined && can(v))
            .map((checkable: Checkable) => checkable.check());
    }
}

/**
 * 集計系のポーリング結果の型。状態だけ持つか、結果もくっついているかのどちらか。
 * {"queryExecutionId": "123", "status": "RUNNING"}
 * or
 * {"queryExecutionId": "123", "status": "SUCCEEDED", "items": [], "nextToken": "abc"}
 */
export type UsageAggregateQueryStatusResult = QueryStatus &
    Partial<Page<CouponUsage>>;

/**
 * 明細系のポーリング結果の型。状態だけ持つか、結果もくっついているかのどちらか。
 */
export type UsageLogQueryStatusResult = QueryStatus &
    Partial<Page<CouponUsageLog>>;

/**
 * 表示集計のポーリング結果の型。結果的に LogQueryStatusResult と同じだが意味が異なるためあえて分けた。
 */
export type DisplayAggregateQueryStatusResult = QueryStatus &
    Partial<Page<CouponUsage>>;

/**
 * 表示明細のポーリング結果の型。結果的に LogQueryStatusResult と同じだが意味が異なるためあえて分けた。
 */
export type DisplayLogQueryStatusResult = QueryStatus &
    Partial<Page<CouponUsageLog>>;

export type QueryCsvResult = QueryStatus & { signedUrl?: string };
export type QueryCsvResultFileName =
    | 'Exchange_by_coupon.csv'
    | 'Exchange_by_shop.csv'
    | 'coupon_access_log_summary.csv'
    | 'coupon_access_log_detail.csv'
    // coupon_list_${luxon.DateTime.local().toFormat('yyyyMMddHHmmss')}.csv
    | string;

export type CouponUsageQueryInput = {
    organizationId: string;
    organizationName?: string;
    couponCode?: string;
    couponName?: string;
    shouldCsvOutput: string;
    groupBy: GroupByString;
    searchPolicy: 'usage' | 'displayed';
    limit?: number;
    offset?: number;
    outputLocation?: string;
    iamRoleArn?: string;
};

/**
 * クーポン利用状況のクエリ
 */
export class CouponUsageQuery {
    organizationId: OrganizationId;
    organizationName: OrganizationName;
    couponCode: CouponCode;
    couponName: CouponName;
    groupBy: GroupBy;
    shouldCsvOutput: boolean;
    searchPolicy: 'usage' | 'displayed';
    limit: Limit;
    offset: Offset;
    outputLocation?: string;
    iamRoleArn?: string;

    static of(input: CouponUsageQueryInput): CouponUsageQuery {
        const obj = new CouponUsageQuery();
        obj.organizationId = new OrganizationId(input.organizationId);
        if (input.organizationName)
            obj.organizationName = new OrganizationName(input.organizationName);
        if (input.couponCode) obj.couponCode = new CouponCode(input.couponCode);
        if (input.couponName) obj.couponName = new CouponName(input.couponName);
        obj.groupBy = new GroupBy(input.groupBy);
        obj.shouldCsvOutput = input.shouldCsvOutput === 'true';
        obj.searchPolicy = input.searchPolicy;
        obj.limit = new Limit(input.limit ? input.limit : Limit.defaultLimit);
        obj.offset = new Offset(
            input.offset ? input.offset : Offset.defaultOffset,
        );
        obj.outputLocation = input.outputLocation;
        obj.iamRoleArn = input.iamRoleArn;

        return obj;
    }

    /**
     * 集計単位をクーポンマスタに固定した状態でオブジェクトを作成します
     * @param input
     */
    static groupByCouponMasterOf(
        input: CouponUsageQueryInput,
    ): CouponUsageQuery {
        const obj = CouponUsageQuery.of(input);
        obj.groupBy = new GroupBy('COUPON_MASTER');
        return obj;
    }

    validateAll(): ValidationResult[] {
        function can(arg: Checkable): arg is Checkable {
            return (arg as Checkable).check !== undefined;
        }

        return Object.values(this)
            .filter((v) => v !== undefined && can(v))
            .map((checkable: Checkable) => checkable.check());
    }
}

/**
 * クーポン利用状況の集計単位
 */
export class GroupBy extends Checkable {
    static readonly property = 'groupBy';

    constructor(readonly value: string) {
        super(
            ValidatorFactory.literalCheckValidator(
                GroupBy.property,
                value,
                'COUPON_MASTER',
                'SHOP',
                'SMALL_SHOP_GROUP',
                'BIG_SHOP_GROUP',
            ),
        );
    }
}
