"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import React from 'react'
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { useForm, type Resolver } from 'react-hook-form'
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract, simulateContract, } from "@wagmi/core"
import { Address, ContractFunctionExecutionError, isAddress, formatEther } from "viem"

import { formSchema } from './airdrop-form-schema'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { config } from "../app/configs/rainbowkit"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { chainsToTSender, erc20Abi, tsenderAbi } from "../app/consts/tsender"

const AirdropForm: React.FC = () => {
    const account = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    const form = useForm<z.input<typeof formSchema>>({
        mode: "all",
        resolver: zodResolver(formSchema) as unknown as Resolver<z.input<typeof formSchema>>,
        defaultValues: {
            tokenAddress: "",
            contacts: "",
            amounts: ""
        },
    })

    const tokenAddress = form.watch("tokenAddress");

    const { data } = useReadContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "name",
        query: {
            enabled: !form.formState.errors.tokenAddress && isAddress(tokenAddress ?? ''),
        }
    });

    const amounts = form.watch("amounts");
    const total = amounts.split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number).reduce((p, c) => p + c, 0);

    async function onSubmit(values: any) {
        if (!account.chainId) {
            toast(`Could retrive chain information`);
            return;
        }

        if (!chainsToTSender[account.chainId]) {
            toast(`Unsupported chain: ${account.chainId}`);
            return;
        }

        const parsed = values as z.infer<typeof formSchema>;
        const total = parsed.amounts.reduce((p, c) => p + c, 0);
        const tsenderAddress = chainsToTSender[account.chainId].tsender;

        const currentBalance = await readContract(config, {
            abi: erc20Abi,
            functionName: 'balanceOf',
            address: parsed.tokenAddress as Address,
            args: [account.address]
        }) as bigint;

        if (currentBalance < total) {
            toast.error("Insufficient Balance", {
                description: <><span>Your account does not have enough balance.</span><span className="block">Required {total}</span> <span className="block">Available {currentBalance}</span></>
            })
            return;
        }

        const currentAllowance = await readContract(config, {
            abi: erc20Abi,
            functionName: 'allowance',
            address: parsed.tokenAddress as Address,
            args: [account.address, tsenderAddress]
        }) as bigint;

        if (currentAllowance < BigInt(total)) {
            try {
                const hash = await writeContractAsync({
                    abi: erc20Abi,
                    functionName: 'approve',
                    address: parsed.tokenAddress as Address,
                    args: [tsenderAddress, BigInt(total)]
                });
                await waitForTransactionReceipt(config, {
                    hash
                });
            } catch (error) {
                console.log(error)
                if (error instanceof ContractFunctionExecutionError) {
                    toast.error("Transaction Failed", {
                        description: error.cause.details
                    });
                } else {
                    toast.error("Transaction Failed", {
                        description: (error as any).message
                    });
                }
                return;
            }
        }

        try {
            const { request, ...rest } = await simulateContract(config, {
                address: tsenderAddress as Address,
                abi: tsenderAbi,
                functionName: "airdropERC20",
                args: [
                    parsed.tokenAddress, parsed.contacts, parsed.amounts, total
                ]
            });

            console.log("rest", rest)
            console.log("request", request);

            const hash = await writeContract(config, request);
            console.log("hash", hash);

            const receipt = await waitForTransactionReceipt(config, { hash });
            if (receipt.status == "success") {
                toast.success("Airdrop Complete!");
                form.reset();
            }

        } catch (error) {
            console.log(error)
            if (error instanceof ContractFunctionExecutionError) {
                toast.error("Transaction Failed", {
                    description: error.cause.details
                });
            } else {
                toast.error("Transaction Failed", {
                    description: (error as any).message
                });
            }
            return;
        }
    }

    if (!account.isConnected) {
        return (
            <div>Please connect your wallet</div>
        )
    }

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-3">
                <FormField
                    control={form.control}
                    name="tokenAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-sm text-gray-700'>Token Address</FormLabel>
                            <FormControl>
                                <Input placeholder="0x" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contacts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-sm text-gray-700'>Recipients</FormLabel>
                            <FormControl>
                                <Textarea placeholder="0x" {...field} />
                            </FormControl>
                            <FormDescription>
                                comma or new line separated
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amounts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-sm text-gray-700'>Amounts (WEI)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="eg: 100000" {...field} />
                            </FormControl>
                            <FormDescription>
                                comma or new line separated
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-4 my-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
                    <span className="text-sm text-gray-400 whitespace-nowrap">Tx summary</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />
                </div>

                <div className="grid grid-cols-2 grid-rows-3 gap-y-2 text-sm text-gray-400 mb-10">
                    <div className="font-semibold">Token Name:</div><div className="justify-self-end">{data as string || "-"}</div>
                    <div className="font-semibold">Amount (wei):</div><div className="justify-self-end">{!isNaN(total) && total !== 0 ? total : "-"}</div>
                    <div className="font-semibold">Amount (tokens):</div><div className="justify-self-end">{!isNaN(total) && total !== 0 ? formatEther(BigInt(total)) : "-"}</div>
                </div>


                <Button className="w-50" disabled={form.formState.isSubmitting || !form.formState.isValid || isPending} type="submit">
                    {
                        form.formState.isSubmitting ? <span className="inline-flex"><Loader2Icon className="animate-spin mr-2" /> Please wait</span> : <span>Send Airdrop</span>
                    }
                </Button>
            </form>
        </Form>
    );
}


export default AirdropForm;

