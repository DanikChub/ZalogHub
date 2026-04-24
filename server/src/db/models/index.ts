import { City } from './City';
import { Deal } from './Deal';
import {Source} from "./Source";

// Deal -> City
Deal.belongsTo(City, {
    foreignKey: 'cityId',
    as: 'city',
});

// City -> Deals
City.hasMany(Deal, {
    foreignKey: 'cityId',
    as: 'deals',
});

Source.hasMany(Deal, {
    foreignKey: 'sourceId',
    as: 'deals',
});

Deal.belongsTo(Source, {
    foreignKey: 'sourceId',
    as: 'source',
});