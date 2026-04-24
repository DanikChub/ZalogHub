import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export type SourceType =
    | 'telegram_channel'
    | 'telegram_chat'
    | 'website'
    | 'manual';

export type SourceAttributes = {
    id: number;

    name: string;
    type: SourceType;
    key: string;

    externalId: string | null;
    title: string | null;
    url: string | null;

    isActive: boolean;
    parseEnabled: boolean;
    parseImages: boolean;

    // 🔥 НОВОЕ
    defaultContactUrl: string | null;

    createdAt?: Date;
    updatedAt?: Date;
};

export type SourceCreationAttributes = Optional<
    SourceAttributes,
    | 'id'
    | 'externalId'
    | 'title'
    | 'url'
    | 'isActive'
    | 'parseEnabled'
    | 'parseImages'
    | 'defaultContactUrl'
    | 'createdAt'
    | 'updatedAt'
>;

export class Source
    extends Model<SourceAttributes, SourceCreationAttributes>
    implements SourceAttributes
{
    declare id: number;

    declare name: string;
    declare type: SourceType;
    declare key: string;

    declare externalId: string | null;
    declare title: string | null;
    declare url: string | null;

    declare isActive: boolean;
    declare parseEnabled: boolean;
    declare parseImages: boolean;

    // 🔥 НОВОЕ
    declare defaultContactUrl: string | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Source.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        type: {
            type: DataTypes.ENUM(
                'telegram_channel',
                'telegram_chat',
                'website',
                'manual',
            ),
            allowNull: false,
        },

        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        externalId: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        parseEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        parseImages: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        // 🔥 НОВОЕ
        defaultContactUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'sources',
        modelName: 'Source',
        indexes: [
            {
                unique: true,
                fields: ['key'],
            },
            {
                fields: ['type'],
            },
            {
                fields: ['externalId'],
            },
            {
                fields: ['parseImages'],
            },
        ],
    },
);