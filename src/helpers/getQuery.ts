import { UserDocument } from "../models/User";
import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';

export const getQuery = (userInfo: UserDocument, key?: string, value?: string) => {
    // if key exists value exists as well
    const notTaxPayer = userInfo.role !== "tax-payer";
    let query: any = {};
    if (notTaxPayer)
        return key ? keyValue(key, value!, query) : {};
    query = { userId: userInfo._id };
    return key ? keyValue(key, value!, query) : { userId: userInfo._id };
};

export const keyValue = (key: string, value: string, query: any) => {
    const notStrings = ["createdAt", "updatedAt", "dueDate"];
    if (notStrings.includes(key))
        return {
            [key]: {
                $gte: startOfDay(new Date(parseInt(value))),
                $lte: endOfDay(new Date(parseInt(value)))
            },
            ...query
        };
    return {
        [key]: { $regex: '.*' + value + '.*' },
        ...query
    };
};