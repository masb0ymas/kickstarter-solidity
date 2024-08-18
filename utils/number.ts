import _ from 'lodash'

const wei = 0
const kwei = 1000
const mwei = kwei * kwei
const gwei = mwei * kwei
const micro = gwei * kwei
const mili = micro * kwei
const ether = mili * kwei

export enum UnitType {
  Ether = "ether",
  Mili = "mili",
  Micro = "micro",
  Gwei = "gwei",
  Mwei = "mwei",
  Kwei = "kwei"
}

export function toWei(value: number, unit?: UnitType) {
  let result = value;

  if (_.isNil(unit)) {
    result = Number(value) * ether;
  }

  switch (unit) {
    case "ether":
      result = Number(value) * ether;
      break;

    case "mili":
      result = Number(value) * mili;
      break;

    case "micro":
      result = Number(value) * micro;
      break;

    case "gwei":
      result = Number(value) * gwei;
      break;

    case "mwei":
      result = Number(value) * mwei;
      break;

    case "kwei":
      result = Number(value) * kwei;
      break;

    default:
      result = Number(value) * wei;
      break;
  }

  return result;
}

export function fromWei(value: number, unit?: UnitType) {
  let result = value;

  if (_.isNil(unit)) {
    result = Number(value) / ether;
  }

  switch (unit) {
    case "ether":
      result = Number(value) / ether;
      break;

    case "mili":
      result = Number(value) / mili;
      break;

    case "micro":
      result = Number(value) / micro;
      break;

    case "gwei":
      result = Number(value) / gwei;
      break;

    case "mwei":
      result = Number(value) / mwei;
      break;

    case "kwei":
      result = Number(value) / kwei;
      break;

    default:
      result = Number(value) / wei;
      break;
  }

  return result;
}