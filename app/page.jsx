import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FEATURES, STEPS, TESTIMONIALS } from "@/lib/landing";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"



export default function Home() {
    return (
        <div className="flex flex-col pt-16">
            <section className="mt-20 pb-12 space-y-10 md:space-y-20 px-5 ">
                <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
                    <Badge variant="outline" className="bg-green-100 text-green-700 ">
                        Split expenses. Simply life
                    </Badge>

                    <h1 className="font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 bg-gradient-to-r from-green-600 to-teal-500 mx-auto max-w-4xl text-4xl  md:text-7xl">
                        The smartest way to split expenses with friends
                    </h1>

                    <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Track shared expenses, split bills effortlessly, and settle up
                        quicky. Never worry about who owes again.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size={"lg"}
                            className="bg-green-600 hover:bg-green-700">
                            <Link href="/dashboard">Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size={"lg"} variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50">
                            <Link href="/How-it-works">See How It Works
                            </Link>
                        </Button>
                    </div>

                    <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl shadow-xl">
                        <div className="bg-gradient-to-r from-green-600 to-teal-500 p-1 aspect-[16/9]">
                            <Image
                                src="/hero.png"
                                width={1280}
                                height={720}
                                alt="Banner"
                                className="rounded-l mx-auto"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        Features
                    </Badge>

                    <h2 className="bg-gradient-to-r from-green-600 to-teal-500 font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 mt-2 text-3xl md:text-4xl ">
                        Everything you need to split expenses
                    </h2>

                    <p className="mx-auto mmt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Our platform provides all the tools you need to
                        handle shared expenses with ease.
                    </p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-col-2 lg:grid-cols-3">
                    {FEATURES.map(({ title, Icon, bg, color, description }) => (
                        <Card key={title}
                            className={`flec flex-col items-center space-y-4 p-6 text-center`}>
                            <div className={`rounded-full p-3 ${bg}`}>
                                <Icon className={`h-6 w-6 ${color}`}></Icon>
                            </div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-gray-500">{description}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <section id="how-it-works" className=" py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        How it works
                    </Badge>

                    <h2 className="bg-gradient-to-r from-green-600 to-teal-500 font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 mt-2 text-3xl md:text-4xl ">
                        Splitting expenses has never been easier
                    </h2>

                    <p className="mx-auto mmt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Follow these simple steps to start tracking and splitting expenses
                        with friends.
                    </p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-col-2 lg:grid-cols-3">
                    {STEPS.map(({ description, label, title }) => (
                        <div key={label} className="flex flex-col items-center space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                                {label}
                            </div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-gray-500 text-center">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        Testimonials
                    </Badge>

                    <h2 className="bg-gradient-to-r from-green-600 to-teal-500 font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 mt-2 text-3xl md:text-4xl ">
                        What our users are saying
                    </h2>


                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-col-2 lg:grid-cols-3">
                    {TESTIMONIALS.map(({ quote, name, role, image }) => (
                        <Card key={name}>

                            <CardContent>
                                <p className="text-gray-500">{quote}</p>


                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src={image} alt={name} />
                                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{name}</p>
                                    <p className="text-sm text-muted-foreground">{role}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-green-600 to-teal-500 ">
                <div className="conatiner mx-auto px-4 md:px-6 text-center space-y-6">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white"> 
                        Ready to simplify expense sharing?
                    </h2>
                    <p className="mx-auto max-w-[600px] text-green-100 md:text-xl/relaxed">
                        Join thousands of users who have made splitting expenses 
                        stress-free.
                    </p>

                    <Button asChild size={"lg"}
                            className="bg-green-600 hover:opacity-90">
                            <Link href="/dashboard">Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                </div>
            </section>

            <footer className="border-t bg-gray-50 py-12 text-center text-sm text-muted-foreground">
                Made with ❤️ by Manisha
            </footer>
        </div>
    );
}
