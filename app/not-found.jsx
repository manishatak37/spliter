import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-centermin-h-[100vh] px-4 text-center mt-20'>
      <h2 className='bg-gradient-to-r from-green-600 to-teal-500 font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 text-6xl  mb-4'>404</h2>
      <p className='text-2xl font-semibold mb-4'>Page not found</p>
      <Link href="/dashboasrd">Return Home</Link>
    </div>
  )
}