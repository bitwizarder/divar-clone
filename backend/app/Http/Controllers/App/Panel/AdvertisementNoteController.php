<?php

namespace App\Http\Controllers\App\Panel;

use App\Http\Controllers\Controller;
use App\Models\Advertise\Advertisement;
use App\Models\Advertise\AdvertisementNote;
use App\Traits\HttpResponses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class AdvertisementNoteController extends Controller
{
    use HttpResponses, AuthorizesRequests; 

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $notes = auth()->user()->advertisementNotes()->get();
        return $this->success('لیست یادداشت ها باموفقیت دریافت شد', 200,  $notes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Advertisement $advertisement, Request $request)
    {
        $request->validate([
            'note' => 'required|string|max:500'
        ]);
        $userId = auth()->user()->id;

        // ۱. ابتدا به دنبال رکورد حذف‌شده بگرد
        $note = AdvertisementNote::withTrashed()
            ->where('user_id', $userId)
            ->where('advertisement_id', $advertisement->id)
            ->first();

        if ($note) {
            // اگر رکورد حذف‌شده وجود داشت، آن را بازیابی کن و به‌روزرسانی کن
            $note->restore();
            $note->update(['note' => $request->note]);
            return $this->success('یادداشت با موفقیت ذخیره شد', 200, $note);
        }

        // ۲. اگر رکورد حذف‌شده نبود، یک رکورد جدید بساز
        $note = AdvertisementNote::create([
            'user_id' => $userId,
            'advertisement_id' => $advertisement->id,
            'note' => $request->note,
        ]);

        return $this->success('یادداشت با موفقیت ذخیره شد', 200, $note);
    }

    /**
     * Display the specified resource.
     */
    public function show(Advertisement $advertisement)
    {
        $note = AdvertisementNote::where('user_id', auth()->user()->id)->where('advertisement_id', $advertisement->id)->first();
        if (!$note) {
            return $this->error('یادداشتی برای این آگهی پیدا نشد', 404);
        }
        return $this->success('یادداشت با موفقیت دریافت شد', 200, $note);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Advertisement $advertisement)
    {
        $note = AdvertisementNote::where('user_id', auth()->user()->id)->where('advertisement_id', $advertisement->id)->first();
        if (!$note) {
            return $this->error('یادداشتی برای این آگهی پیدا نشد', 404);
        }
        $note->delete();
        return $this->success('یادداشت با موفقیت حذف شد');
    }
}
