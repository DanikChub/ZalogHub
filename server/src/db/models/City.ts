import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export type CityAttributes = {
    id: number;

    name: string;
    slug: string;

    regionName: string | null;
    federalDistrict: string | null;

    population: number | null;

    latitude: number | null;
    longitude: number | null;

    createdAt?: Date;
    updatedAt?: Date;
};

export type CityCreationAttributes = Optional<
    CityAttributes,
    'id' | 'regionName' | 'federalDistrict' | 'population' | 'latitude' | 'longitude' | 'createdAt' | 'updatedAt'
>;

export class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
    declare id: number;

    declare name: string;
    declare slug: string;

    declare regionName: string | null;
    declare federalDistrict: string | null;

    declare population: number | null;

    declare latitude: number | null;
    declare longitude: number | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

City.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        regionName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        federalDistrict: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        population: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },

        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'cities',
        modelName: 'City',
    }
);