"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Input,
} from "@nextui-org/react";
import { states } from "@/lib/content/states";

interface State {
  stateName: string;
  conservative: number;
  beauty: number;
  cost: number;
  costal: boolean;
  averageTemp: number;
  propertyTaxes: number;
  propertyAppreciation: number;
  populationPerSquareMile: number;
  crimeRate: number;
  education: number;
}

interface StateWithScore extends State {
  score: number;
}

const getColor = (value: number, flipColor?: boolean) => {
  const greenValue = 255 - Math.floor((value / 49) * 255);
  const redValue = Math.floor((value / 49) * 255);

  return `rgb(${flipColor ? greenValue : redValue}, ${
    flipColor ? redValue : greenValue
  }, 0)`;
};

function Label({ label }: Record<string, string | number | boolean>) {
  return <span className="font-bold">{label}: </span>;
}

function OutOf50({
  label,
  value,
  score,
  flipColor,
}: Record<string, string | number | boolean>) {
  return (
    <div className="flex justify-between items-center gap-4">
      <p>
        <Label {...{ label }} />
        <span
          style={{
            color: getColor(Number(value), flipColor as boolean),
          }}
        >
          #{value}
        </span>
        <span> out of 50</span>
      </p>
      <p>{score}</p>
    </div>
  );
}

function LabelAndValue({
  label,
  value,
  score,
}: Record<string, string | number | boolean>) {
  return (
    <div className="flex justify-between items-center gap-4">
      <p>
        <Label {...{ label }} />
        {value}
      </p>
      <p>{(score as number).toFixed(2)}</p>
    </div>
  );
}

const costalParam = "prioritize-costal";
const costalWeightParam = "costal-weight";
const beautyParam = "prioritize-beauty";
const beautyWeightParam = "beauty-weight";
const costParam = "prioritize-cost";
const costWeightParam = "cost-weight";
const conservativenessParam = "prioritize-conservativeness";
const conservativenessWeightParam = "conservativeness-weight";
const averageTempParam = "prioritize-average-temp";
const averageTempWeightParam = "average-temp-weight";
const propertyAppreciationParam = "prioritize-property-appreciation";
const propertyAppreciationWeightParam = "property-appreciation-weight";
const propertyTaxesParam = "prioritize-property-taxes";
const propertyTaxesWeightParam = "property-taxes-weight";
const populationPerSquareMileParam = "prioritize-population-density";
const populationPerSquareMileWeightParam = "population-density-weight";
const lowCrimeRateParam = "prioritize-low-crime";
const lowCrimeRateWeightParam = "low-crime-weight";
const educationParam = "Prioritize-education";
const educationWeightParam = "education-weight";
const bestAverageTempParam = "best-average-temp";
const bestPopulationPerSquareMileParam = "best-population-density";

const prioritizeMultiplier = 2;
const defaultMultiplier = 1;
const notPrioritizeMultiplier = 0.5;

const minimum = 0;

export default function Home() {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const costalPrioritized =
    searchParams.get(costalParam)?.toString() === "true";
  const costalWeight = Number(
    searchParams.get(costalWeightParam)?.toString() || 1
  );
  const beautyPrioritized =
    searchParams.get(beautyParam)?.toString() === "true";
  const beautyWeight = Number(
    searchParams.get(beautyWeightParam)?.toString() || 1
  );
  const costPrioritized = searchParams.get(costParam)?.toString() === "true";
  const costWeight = Number(searchParams.get(costWeightParam)?.toString() || 1);
  const conservativenessPrioritized =
    searchParams.get(conservativenessParam)?.toString() === "true";
  const conservativenessWeight = Number(
    searchParams.get(conservativenessWeightParam)?.toString() || 1
  );
  const averageTempPrioritized =
    searchParams.get(averageTempParam)?.toString() === "true";
  const averageTempWeight = Number(
    searchParams.get(averageTempWeightParam)?.toString() || 1
  );
  const propertyAppreciationPrioritized =
    searchParams.get(propertyAppreciationParam)?.toString() === "true";
  const propertyAppreciationWeight = Number(
    searchParams.get(propertyAppreciationWeightParam)?.toString() || 1
  );
  const propertyTaxesPrioritized =
    searchParams.get(propertyTaxesParam)?.toString() === "true";
  const propertyTaxesWeight = Number(
    searchParams.get(propertyTaxesWeightParam)?.toString() || 1
  );
  const populationDensityPrioritized =
    searchParams.get(populationPerSquareMileParam)?.toString() === "true";
  const populationDensityWeight =
    Number(searchParams.get(populationPerSquareMileWeightParam)?.toString()) ||
    1;
  const lowCrimeRatePrioritized =
    searchParams.get(lowCrimeRateParam)?.toString() === "true";
  const lowCrimeRateWeight = Number(
    searchParams.get(lowCrimeRateWeightParam)?.toString() || 1
  );
  const educationPrioritized =
    searchParams.get(educationParam)?.toString() === "true";
  const educationWeight = Number(
    searchParams.get(educationWeightParam)?.toString() || 1
  );

  const prioritizing =
    costPrioritized ||
    beautyPrioritized ||
    conservativenessPrioritized ||
    averageTempPrioritized ||
    costalPrioritized ||
    propertyAppreciationPrioritized ||
    propertyTaxesPrioritized ||
    populationDensityPrioritized ||
    lowCrimeRatePrioritized ||
    educationPrioritized;

  const bestAverageTemp =
    Number(searchParams.get(bestAverageTempParam)?.toString()) || 55;
  const bestPopulationPerSquareMile =
    Number(searchParams.get(bestPopulationPerSquareMileParam)?.toString()) ||
    50;

  const [statesSorted, setStatesSorted] = useState<StateWithScore[]>([]);
  const [rankedByAppreciation, setRankedByAppreciation] = useState<State[]>([]);

  const flipHigher = (value: number) => 50 - value;
  const min = (value: number) => (value > minimum ? value : minimum);
  const weighted = (value: number, prioritize: boolean, weight: number) =>
    value *
    (prioritize
      ? weight * prioritizeMultiplier
      : prioritizing
      ? weight * notPrioritizeMultiplier
      : weight * defaultMultiplier);

  const getValueScore = (value: number, prioritize: boolean, weight: number) =>
    weighted(value, prioritize, weight);

  const getFlippedValueScore = (
    value: number,
    prioritize: boolean,
    weight: number
  ) => weighted(flipHigher(value), prioritize, weight);

  const getAverageTempScore = (value: number, weight: number) =>
    weighted(
      flipHigher(Math.abs(value - bestAverageTemp)),
      averageTempPrioritized,
      weight
    );

  const getPopulationPerSquareMileScore = (value: number, weight: number) =>
    weighted(
      min(flipHigher(Math.abs(value - bestPopulationPerSquareMile))),
      populationDensityPrioritized,
      weight
    );

  const getCostalScore = (value: boolean, weight: number) =>
    weighted(value ? 25 : 0, costalPrioritized, weight);

  const getScore = (state: State) => {
    const {
      stateName,
      cost,
      beauty,
      conservative,
      averageTemp,
      costal,
      propertyTaxes,
      populationPerSquareMile,
      crimeRate,
      education,
    } = state;

    const educationScore = getFlippedValueScore(
      education,
      educationPrioritized,
      educationWeight
    );
    console.log(educationScore);
    console.log(educationScore);

    const populationPerSquareMileScore = getPopulationPerSquareMileScore(
      populationPerSquareMile,
      populationDensityWeight
    );
    let place = 0;
    rankedByAppreciation.forEach((ranked, index) => {
      if (ranked.stateName === stateName) place = index;
    });
    const propertyAppreciationScore = getFlippedValueScore(
      place,
      propertyAppreciationPrioritized,
      propertyAppreciationWeight
    );
    const crimeScore = getValueScore(
      crimeRate,
      lowCrimeRatePrioritized,
      lowCrimeRateWeight
    );
    const propertyTaxesScore = getFlippedValueScore(
      propertyTaxes,
      propertyTaxesPrioritized,
      propertyTaxesWeight
    );
    const costScore = getFlippedValueScore(cost, costPrioritized, costWeight);
    const beautyScore = getFlippedValueScore(
      beauty,
      beautyPrioritized,
      beautyWeight
    );
    const conservativeScore = getFlippedValueScore(
      conservative,
      conservativenessPrioritized,
      conservativenessWeight
    );
    const averageTempScore = getAverageTempScore(
      averageTemp,
      averageTempWeight
    );

    const costalScore = getCostalScore(costal, costalWeight);

    return (
      costScore +
      beautyScore +
      conservativeScore +
      averageTempScore +
      costalScore +
      educationScore +
      populationPerSquareMileScore +
      crimeScore +
      propertyTaxesScore +
      propertyAppreciationScore
    );
  };

  useEffect(() => {
    const newStatesWithScores = states.map((state) => ({
      ...state,
      score: getScore(state),
    }));

    const newSortedStates = newStatesWithScores.sort((a, b) =>
      a.score > b.score ? -1 : 1
    );

    setStatesSorted(newSortedStates);
  }, [
    costPrioritized,
    beautyPrioritized,
    conservativenessPrioritized,
    averageTempPrioritized,
    costalPrioritized,
    bestAverageTemp,
    propertyAppreciationPrioritized,
    propertyTaxesPrioritized,
    lowCrimeRatePrioritized,
    educationPrioritized,
    populationDensityPrioritized,
    bestPopulationPerSquareMile,
    rankedByAppreciation,
    conservativenessWeight,
    lowCrimeRateWeight,
    educationWeight,
    populationDensityWeight,
    costWeight,
    propertyAppreciationWeight,
    propertyTaxesWeight,
    costalWeight,
    beautyWeight,
    averageTempWeight,
  ]);

  useEffect(() => {
    const fake = states.map((state) => state);
    const sortedByApp = fake.sort((a, b) =>
      a.propertyAppreciation > b.propertyAppreciation ? -1 : 1
    );

    setRankedByAppreciation(sortedByApp);
  }, [states]);

  function handleChange(param: string, value: boolean | string) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(param, value.toString());
    } else {
      params.delete(param);
    }

    replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <main className="flex flex-col mx-auto max-w-6xl p-6 gap-10 my-12">
      <div className="text-center flex flex-col gap-4 max-w-4xl mx-auto">
        <h1>States Ranker</h1>
        <p className="underline">Priorities</p>
        <p>
          The States Ranker works by calculating the{" "}
          <b className="text-white">combined score</b> the state receives from
          each attribute. For example, if you prioritize {"'Low Crime Rate'"},
          the state with the lowest crime rate may still not be number one if
          the combined score is still lower than other states.
        </p>
        <p className="underline">Score Weight</p>
        <p>
          The {"'Score Weight'"} section allows you to adjust the importance of
          each priority.
        </p>
      </div>
      <div className="flex flex-col gap-2 flex-wrap">
        <div className="mb-4 flex justify-between items-center">
          <h2>Priorities</h2>
          <h2 className="text-left">Score Weight</h2>
        </div>
        <Label label="Cultural" />

        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={conservativenessPrioritized}
            onValueChange={(e) => handleChange(conservativenessParam, e)}
          >
            Conservativeness (Based on 2020 voter data)
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={conservativenessWeight.toString()}
            onValueChange={(e) => handleChange(conservativenessWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={lowCrimeRatePrioritized}
            onValueChange={(e) => handleChange(lowCrimeRateParam, e)}
          >
            Low Crime
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={lowCrimeRateWeight.toString()}
            onValueChange={(e) => handleChange(lowCrimeRateWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={educationPrioritized}
            onValueChange={(e) => handleChange(educationParam, e)}
          >
            Education
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={educationWeight.toString()}
            onValueChange={(e) => handleChange(educationWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={populationDensityPrioritized}
            onValueChange={(e) => handleChange(populationPerSquareMileParam, e)}
          >
            Population Density
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={populationDensityWeight.toString()}
            onValueChange={(e) =>
              handleChange(populationPerSquareMileWeightParam, e)
            }
          />
        </div>
        <div className="max-w-80">
          <Input
            min={20}
            max={80}
            type="number"
            defaultValue={bestPopulationPerSquareMile.toString()}
            onValueChange={(e) =>
              handleChange(bestPopulationPerSquareMileParam, e)
            }
            label="What is the best population/square mile?"
          />
        </div>
        <Label label="Economical" />
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={costPrioritized}
            onValueChange={(e) => handleChange(costParam, e)}
          >
            Low Housing Cost
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={costWeight.toString()}
            onValueChange={(e) => handleChange(costWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={propertyAppreciationPrioritized}
            onValueChange={(e) => handleChange(propertyAppreciationParam, e)}
          >
            High Property Appreciation
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={propertyAppreciationWeight.toString()}
            onValueChange={(e) =>
              handleChange(propertyAppreciationWeightParam, e)
            }
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={propertyTaxesPrioritized}
            onValueChange={(e) => handleChange(propertyTaxesParam, e)}
          >
            Low Property Taxes
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={propertyTaxesWeight.toString()}
            onValueChange={(e) => handleChange(propertyTaxesWeightParam, e)}
          />
        </div>
        <Label label="Aesthetics" />
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={costalPrioritized}
            onValueChange={(e) => handleChange(costalParam, e)}
          >
            Costal States
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={costalWeight.toString()}
            onValueChange={(e) => handleChange(costalWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={beautyPrioritized}
            onValueChange={(e) => handleChange(beautyParam, e)}
          >
            Natural Beauty
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={beautyWeight.toString()}
            onValueChange={(e) => handleChange(beautyWeightParam, e)}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Checkbox
            defaultSelected={averageTempPrioritized}
            onValueChange={(e) => handleChange(averageTempParam, e)}
          >
            Average Temperate (Fahrenheit)
          </Checkbox>
          <Input
            min={0}
            max={2}
            type="number"
            className="max-w-16"
            defaultValue={averageTempWeight.toString()}
            onValueChange={(e) => handleChange(averageTempWeightParam, e)}
          />
        </div>
        <div className="max-w-80">
          <Input
            min={20}
            max={80}
            type="number"
            defaultValue={bestAverageTemp.toString()}
            onValueChange={(e) => handleChange(bestAverageTempParam, e)}
            label="What is the best average Temp?"
          />
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="mb-4">
          <h2>Result:</h2>
        </div>
        <div className="flex justify-between px-4">
          <p>Data</p>
          <p>Score</p>
        </div>
        <div className="flex flex-col gap-8">
          {statesSorted.map(
            (
              {
                stateName,
                costal,
                conservative,
                cost,
                averageTemp,
                beauty,
                score,
                crimeRate,
                education,
                populationPerSquareMile,
                propertyTaxes,
                propertyAppreciation,
              },
              index
            ) => {
              let place = 0;
              rankedByAppreciation.forEach((ranked, index) => {
                if (ranked.stateName === stateName) place = index;
              });
              const appreciationColor = getColor(place);
              return (
                <Card key={stateName} className="bg-zinc-800">
                  <CardHeader className="flex justify-between items-center gap-4">
                    <h2
                      className="truncate"
                      style={{
                        color: getColor(index),
                      }}
                    >
                      {stateName}
                    </h2>
                    <h3
                      className="truncate"
                      style={{
                        color: getColor(index),
                      }}
                    >
                      #{index + 1}
                    </h3>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Label label="Cultural" />
                    <OutOf50
                      label="Conservativeness"
                      value={conservative}
                      score={getFlippedValueScore(
                        conservative,
                        conservativenessPrioritized,
                        conservativenessWeight
                      )}
                    />
                    <OutOf50
                      label="High Crime (Lower value is better)"
                      value={crimeRate}
                      score={getValueScore(
                        crimeRate,
                        lowCrimeRatePrioritized,
                        lowCrimeRateWeight
                      )}
                      flipColor
                    />
                    <OutOf50
                      label="Education"
                      value={education}
                      score={getFlippedValueScore(
                        education,
                        educationPrioritized,
                        educationWeight
                      )}
                    />
                    <LabelAndValue
                      label="Population Density"
                      value={populationPerSquareMile}
                      score={getPopulationPerSquareMileScore(
                        populationPerSquareMile,
                        populationDensityWeight
                      )}
                    />
                    <div className="my-2" />
                    <Label label="Economical" />
                    <OutOf50
                      label="Housing Cost"
                      value={cost}
                      score={getFlippedValueScore(
                        cost,
                        costPrioritized,
                        costWeight
                      )}
                    />
                    <div className="flex justify-between items-center gap-4">
                      <p>
                        <span className="font-bold">
                          Property Appreciation:{" "}
                        </span>
                        <span
                          style={{
                            color: appreciationColor,
                          }}
                        >
                          {`${propertyAppreciation}%`}
                        </span>
                      </p>
                      <p>
                        {getFlippedValueScore(
                          place,
                          propertyAppreciationPrioritized,
                          propertyAppreciationWeight
                        )}
                      </p>
                    </div>
                    <OutOf50
                      label="Low Property Taxes"
                      value={propertyTaxes}
                      score={getFlippedValueScore(
                        propertyTaxes,
                        propertyTaxesPrioritized,
                        propertyTaxesWeight
                      )}
                    />
                    <div className="my-2" />
                    <Label label="Aesthetics" />
                    <div className="flex justify-between items-center gap-4">
                      <p>
                        <span className="font-bold">Is on the coast: </span>
                        <span
                          className={costal ? "text-blue-500" : "text-red-600"}
                        >
                          {costal.toString()}
                        </span>
                      </p>
                      <p>{getCostalScore(costal, costalWeight)}</p>
                    </div>
                    <OutOf50
                      label="Natural Beauty"
                      value={beauty}
                      score={getFlippedValueScore(
                        beauty,
                        beautyPrioritized,
                        beautyWeight
                      )}
                    />
                    <LabelAndValue
                      label="Average Temperature (Fahrenheit)"
                      value={averageTemp}
                      score={getAverageTempScore(
                        averageTemp,
                        averageTempWeight
                      )}
                    />
                  </CardBody>
                  <Divider />
                  <CardFooter className="flex justify-end items-center">
                    <p>
                      <Label label="Total Score" />
                      {score.toFixed(2)}
                    </p>
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>
      </div>
    </main>
  );
}
