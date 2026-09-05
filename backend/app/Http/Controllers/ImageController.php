<?php

namespace App\Http\Controllers;

use App\Http\Services\Image\ImageService;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('image');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ImageService $imageservice)
    {
        if ($request->hasFile('image')) {
            $imageservice->setExclusiveDirectory('images' . DIRECTORY_SEPARATOR . 'category-images');
            // $result = $imageservice->save($request->image);
            // $result = $imageservice->fitAndSave($request->image,100,200);
            $result = $imageservice->createIndexAndSave($request->image);
            dd($result);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
