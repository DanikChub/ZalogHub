import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { City } from './City';
import { Source } from './Source';

export type BorrowerType =
    | 'individual'
    | 'self_employed'
    | 'sole_proprietor'
    | 'company';

export type InterestRateSource =
    | 'provided'
    | 'parsed'
    | 'estimated';

export type ContactUrlSource =
    | 'parsed'
    | 'dynamic'
    | 'default';

export type DealAttributes = {
    id: number;

    sourceId: number;
    externalMessageId: string;
    publishedAt: Date | null;

    objectName: string | null;
    type: string | null;
    address: string | null;
    fullText: string | null;

    parsedCityRaw: string | null;
    cityId: number | null;

    loanAmount: number | null;
    collateralValue: number | null;

    interestRateMonthly: number | null;
    interestRateMonthlySource: InterestRateSource | null;
    loanTermMonths: number | null;

    borrowerType: BorrowerType | null;

    ltv: number | null;
    monthlyIncome: number | null;
    totalIncome: number | null;

    objectParams: string | null;

    isTopDeal: boolean;
    topDealScore: number | null;

    contactUrl: string | null;
    contactUrlSource: ContactUrlSource | null;
    postUrl: string | null;

    images: any[] | null;

    createdAt?: Date;
    updatedAt?: Date;
};

export type DealCreationAttributes = Optional<
    DealAttributes,
    | 'id'
    | 'publishedAt'
    | 'objectName'
    | 'type'
    | 'address'
    | 'fullText'
    | 'parsedCityRaw'
    | 'cityId'
    | 'loanAmount'
    | 'collateralValue'
    | 'interestRateMonthly'
    | 'interestRateMonthlySource'
    | 'loanTermMonths'
    | 'borrowerType'
    | 'ltv'
    | 'monthlyIncome'
    | 'totalIncome'
    | 'objectParams'
    | 'isTopDeal'
    | 'topDealScore'
    | 'contactUrl'
    | 'contactUrlSource'
    | 'postUrl'
    | 'images'
    | 'createdAt'
    | 'updatedAt'
>;

export class Deal extends Model<DealAttributes, DealCreationAttributes> implements DealAttributes {
    declare id: number;

    declare sourceId: number;
    declare externalMessageId: string;
    declare publishedAt: Date | null;

    declare objectName: string | null;
    declare type: string | null;
    declare address: string | null;
    declare fullText: string | null;

    declare parsedCityRaw: string | null;
    declare cityId: number | null;

    declare loanAmount: number | null;
    declare collateralValue: number | null;

    declare interestRateMonthly: number | null;
    declare interestRateMonthlySource: InterestRateSource | null;
    declare loanTermMonths: number | null;

    declare borrowerType: BorrowerType | null;

    declare ltv: number | null;
    declare monthlyIncome: number | null;
    declare totalIncome: number | null;

    declare objectParams: string | null;

    declare isTopDeal: boolean;
    declare topDealScore: number | null;

    declare contactUrl: string | null;
    declare contactUrlSource: ContactUrlSource | null;
    declare postUrl: string | null;

    declare images: any[] | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Deal.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        sourceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Source,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },

        externalMessageId: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        objectName: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        type: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        fullText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        parsedCityRaw: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: City,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },

        loanAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        collateralValue: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        interestRateMonthly: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        interestRateMonthlySource: {
            type: DataTypes.ENUM('provided', 'parsed', 'estimated'),
            allowNull: true,
        },

        loanTermMonths: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        borrowerType: {
            type: DataTypes.ENUM(
                'individual',
                'self_employed',
                'sole_proprietor',
                'company',
            ),
            allowNull: true,
        },

        ltv: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        monthlyIncome: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        totalIncome: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        objectParams: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        isTopDeal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        topDealScore: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        contactUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        contactUrlSource: {
            type: DataTypes.ENUM('parsed', 'dynamic', 'default'),
            allowNull: true,
        },

        postUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        images: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'deals',
        modelName: 'Deal',
        indexes: [
            {
                unique: true,
                fields: ['sourceId', 'externalMessageId'],
            },
            {
                fields: ['cityId'],
            },
            {
                fields: ['loanAmount'],
            },
            {
                fields: ['interestRateMonthly'],
            },
            {
                fields: ['ltv'],
            },
            {
                fields: ['isTopDeal'],
            },
            {
                fields: ['topDealScore'],
            },
            {
                fields: ['contactUrlSource'],
            },
        ],
    },
);