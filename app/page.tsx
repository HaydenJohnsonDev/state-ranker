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
    <div className="flex justify-between items-center">
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
    <div className="flex justify-between items-center">
      <p>
        <Label {...{ label }} />
        {value}
      </p>
      <p>{(score as number).toFixed(2)}</p>
    </div>
  );
}

const costalParam = "prioritize-costal";
const beautyParam = "prioritize-beauty";
const costParam = "prioritize-cost";
const conservativenessParam = "prioritize-conservativeness";
const averageTempParam = "prioritize-average-temp";
const propertyAppreciationParam = "prioritize-property-appreciation";
const propertyTaxesParam = "prioritize-property-taxes";
const populationPerSquareMileParam = "prioritize-population-density";
const lowCrimeRateParam = "prioritize-low-crime";
const educationParam = "Prioritize-education";

const bestAverageTempParam = "best-average-temp";
const bestPopulationPerSquareMileParam = "best-population-density";

const prioritizeMultiplier = 2;
const defaultMultiplier = 1;
const notPrioritizeMultiplier = 0.5;

const minimum = -1;

export default function Home() {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const costalPrioritized =
    searchParams.get(costalParam)?.toString() === "true";
  const beautyPrioritized =
    searchParams.get(beautyParam)?.toString() === "true";
  const costPrioritized = searchParams.get(costParam)?.toString() === "true";
  const conservativenessPrioritized =
    searchParams.get(conservativenessParam)?.toString() === "true";
  const averageTempPrioritized =
    searchParams.get(averageTempParam)?.toString() === "true";
  const propertyAppreciationPrioritized =
    searchParams.get(propertyAppreciationParam)?.toString() === "true";
  const propertyTaxesPrioritized =
    searchParams.get(propertyTaxesParam)?.toString() === "true";
  const populationDensityPrioritized =
    searchParams.get(populationPerSquareMileParam)?.toString() === "true";
  const lowCrimeRatePrioritized =
    searchParams.get(lowCrimeRateParam)?.toString() === "true";
  const educationPrioritized =
    searchParams.get(educationParam)?.toString() === "true";

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

  const getValueScore = (value: number, prioritize: boolean) =>
    value *
    (prioritize
      ? prioritizeMultiplier
      : prioritizing
      ? notPrioritizeMultiplier
      : defaultMultiplier);
  const getFlippedValueScore = (value: number, prioritize: boolean) =>
    flipHigher(value) *
    (prioritize
      ? prioritizeMultiplier
      : prioritizing
      ? notPrioritizeMultiplier
      : defaultMultiplier);
  const getAverageTempScore = (value: number) =>
    flipHigher(Math.abs(value - bestAverageTemp)) *
    (averageTempPrioritized
      ? prioritizeMultiplier
      : prioritizing
      ? notPrioritizeMultiplier
      : defaultMultiplier);
  const getPopulationPerSquareMileScore = (value: number) =>
    min(flipHigher(Math.abs(value - bestPopulationPerSquareMile))) *
    (populationDensityPrioritized
      ? prioritizeMultiplier
      : prioritizing
      ? notPrioritizeMultiplier
      : defaultMultiplier);
  const getCostalScore = (value: boolean) =>
    (value ? 25 : 0) *
    (costalPrioritized
      ? prioritizeMultiplier
      : prioritizing
      ? notPrioritizeMultiplier
      : defaultMultiplier);

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
      educationPrioritized
    );
    const populationPerSquareMileScore = getPopulationPerSquareMileScore(
      populationPerSquareMile
    );
    let place = 0;
    rankedByAppreciation.forEach((ranked, index) => {
      if (ranked.stateName === stateName) place = index;
    });
    const propertyAppreciationScore = getFlippedValueScore(
      place,
      propertyAppreciationPrioritized
    );
    const crimeScore = getValueScore(crimeRate, lowCrimeRatePrioritized);
    const propertyTaxesScore = getFlippedValueScore(
      propertyTaxes,
      propertyTaxesPrioritized
    );
    const costScore = getFlippedValueScore(cost, costPrioritized);
    const beautyScore = getFlippedValueScore(beauty, beautyPrioritized);
    const conservativeScore = getFlippedValueScore(
      conservative,
      conservativenessPrioritized
    );
    const averageTempScore = getAverageTempScore(averageTemp);

    const costalScore = getCostalScore(costal);
    console.log(
      state.stateName,
      (costal ? 50 : 25) * (costalPrioritized ? 2 : 1)
    );

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
      <h1>States Ranker</h1>
      <div className="flex flex-col gap-2 flex-wrap">
        <div className="mb-4">
          <h2>Priorities:</h2>
          <p>
            Select what parameters should have a greater affect on the final
            score.
          </p>
        </div>
        <Label label="Cultural" />
        <Checkbox
          defaultSelected={conservativenessPrioritized}
          onValueChange={(e) => handleChange(conservativenessParam, e)}
        >
          Conservativeness (Based on 2020 voter data)
        </Checkbox>
        <Checkbox
          defaultSelected={lowCrimeRatePrioritized}
          onValueChange={(e) => handleChange(lowCrimeRateParam, e)}
        >
          Low Crime
        </Checkbox>
        <Checkbox
          defaultSelected={educationPrioritized}
          onValueChange={(e) => handleChange(educationParam, e)}
        >
          Education
        </Checkbox>
        <Checkbox
          defaultSelected={populationDensityPrioritized}
          onValueChange={(e) => handleChange(populationPerSquareMileParam, e)}
        >
          Population Density
        </Checkbox>
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
        <Checkbox
          defaultSelected={costPrioritized}
          onValueChange={(e) => handleChange(costParam, e)}
        >
          Low Housing Cost
        </Checkbox>
        <Checkbox
          defaultSelected={propertyAppreciationPrioritized}
          onValueChange={(e) => handleChange(propertyAppreciationParam, e)}
        >
          High Property Appreciation
        </Checkbox>
        <Checkbox
          defaultSelected={propertyTaxesPrioritized}
          onValueChange={(e) => handleChange(propertyTaxesParam, e)}
        >
          Low Property Taxes
        </Checkbox>
        <Label label="Aesthetics" />
        <Checkbox
          defaultSelected={costalPrioritized}
          onValueChange={(e) => handleChange(costalParam, e)}
        >
          Costal States
        </Checkbox>
        <Checkbox
          defaultSelected={beautyPrioritized}
          onValueChange={(e) => handleChange(beautyParam, e)}
        >
          Natural Beauty
        </Checkbox>
        <Checkbox
          defaultSelected={averageTempPrioritized}
          onValueChange={(e) => handleChange(averageTempParam, e)}
        >
          Average Temperate (Fahrenheit)
        </Checkbox>
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
                  <CardHeader className="flex justify-between items-center">
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
                        conservativenessPrioritized
                      )}
                    />
                    <OutOf50
                      label="High Crime (Lower value is better)"
                      value={crimeRate}
                      score={getValueScore(crimeRate, lowCrimeRatePrioritized)}
                      flipColor
                    />
                    <OutOf50
                      label="Education"
                      value={education}
                      score={getFlippedValueScore(
                        education,
                        educationPrioritized
                      )}
                    />
                    <LabelAndValue
                      label="Population Density"
                      value={populationPerSquareMile}
                      score={getPopulationPerSquareMileScore(
                        populationPerSquareMile
                      )}
                    />
                    <div className="my-2" />
                    <Label label="Economical" />
                    <OutOf50
                      label="Housing Cost"
                      value={cost}
                      score={getFlippedValueScore(cost, costPrioritized)}
                    />
                    <div className="flex justify-between items-center">
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
                          propertyAppreciationPrioritized
                        )}
                      </p>
                    </div>
                    <OutOf50
                      label="Low Property Taxes"
                      value={propertyTaxes}
                      score={getFlippedValueScore(
                        propertyTaxes,
                        propertyTaxesPrioritized
                      )}
                    />
                    <div className="my-2" />
                    <Label label="Aesthetics" />
                    <div className="flex justify-between items-center">
                      <p>
                        <span className="font-bold">Is on the coast: </span>
                        <span
                          className={costal ? "text-blue-500" : "text-red-600"}
                        >
                          {costal.toString()}
                        </span>
                      </p>
                      <p>{getCostalScore(costal)}</p>
                    </div>
                    <OutOf50
                      label="Natural Beauty"
                      value={beauty}
                      score={getFlippedValueScore(beauty, beautyPrioritized)}
                    />
                    <LabelAndValue
                      label="Average Temperature (Fahrenheit)"
                      value={averageTemp}
                      score={getAverageTempScore(averageTemp)}
                    />
                  </CardBody>
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
