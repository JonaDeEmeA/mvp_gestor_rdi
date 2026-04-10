import * as OBC from "@thatopen/components";
const classifier = new OBC.Classifier(new OBC.Components());
console.log("Classifier methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(classifier)));
